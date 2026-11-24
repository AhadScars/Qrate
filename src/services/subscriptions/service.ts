import { addDays } from "date-fns";
import { prisma } from "@/lib/db/prisma";
import { audit } from "@/lib/audit";
import { getSettings, planFromSettings } from "@/lib/config/settings";
import { evaluateAccess, restoredStatus, type AccessDecision } from "@/services/subscriptions/access";

export async function openTrial(businessId: string, now = new Date()) {
  const settings = await getSettings();
  const plan = planFromSettings(settings);
  const trialEnd = addDays(now, plan.trialDays);
  await prisma.trial.create({
    data: { businessId, startDate: now, endDate: trialEnd },
  });
  await prisma.subscription.create({
    data: {
      businessId,
      planName: plan.planName,
      amountPaise: plan.amountPaise,
      currency: plan.currency,
      status: "TRIAL",
      trialStart: now,
      trialEnd,
      paymentStatus: "UNPAID",
    },
  });
  return trialEnd;
}

export async function getBusinessAccess(businessId: string, now = new Date()): Promise<AccessDecision & { businessStatus: string }> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      trials: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!business || business.deletedAt) {
    return {
      allowed: false,
      state: "DEACTIVATED",
      endsAt: null,
      reason: "This business is not available.",
      businessStatus: "DEACTIVATED",
    };
  }
  const subscription = business.subscriptions[0] ?? null;
  const trial = business.trials[0] ?? null;
  const decision = evaluateAccess({
    now,
    businessStatus: business.status,
    trial: trial ? { endDate: trial.endDate, isDisabled: trial.isDisabled } : null,
    subscription: subscription
      ? {
          status: subscription.status,
          endDate: subscription.endDate,
          trialEnd: subscription.trialEnd,
          paymentStatus: subscription.paymentStatus,
        }
      : null,
  });

  if (subscription && subscription.status !== "SUSPENDED" && subscription.status !== "CANCELLED") {
    const shouldExpire =
      (subscription.status === "TRIAL" && decision.state === "EXPIRED") ||
      (subscription.status === "ACTIVE" && decision.state === "EXPIRED");
    if (shouldExpire) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });
    }
  }

  return { ...decision, businessStatus: business.status };
}

export async function requestManualPayment(businessId: string, userId: string) {
  const settings = await getSettings();
  const plan = planFromSettings(settings);
  const payment = await prisma.payment.create({
    data: {
      businessId,
      amountPaise: plan.amountPaise,
      currency: plan.currency,
      status: "PENDING",
      provider: "MANUAL",
      note: "Owner asked for manual activation.",
    },
  });
  await audit(userId, "payment.request", "Payment", payment.id, { amountPaise: plan.amountPaise });
  return payment;
}

export async function activatePaidPlan(input: {
  businessId: string;
  actorId: string | null;
  reference: string;
  paymentId?: string;
  provider?: string;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const settings = await getSettings();
  const plan = planFromSettings(settings);
  const business = await prisma.business.findUnique({ where: { id: input.businessId } });
  if (!business || business.deletedAt) throw new Error("Business not found.");

  const latest = await prisma.subscription.findFirst({
    where: { businessId: input.businessId },
    orderBy: { createdAt: "desc" },
  });
  const trial = await prisma.trial.findFirst({
    where: { businessId: input.businessId },
    orderBy: { createdAt: "desc" },
  });

  const subscription = await prisma.subscription.create({
    data: {
      businessId: input.businessId,
      planName: plan.planName,
      amountPaise: plan.amountPaise,
      currency: plan.currency,
      status: "ACTIVE",
      startDate: now,
      endDate: addDays(now, plan.durationDays),
      trialStart: latest?.trialStart ?? trial?.startDate,
      trialEnd: latest?.trialEnd ?? trial?.endDate,
      paymentStatus: "PAID",
      paymentRef: input.reference,
    },
  });

  if (input.paymentId) {
    await prisma.payment.update({
      where: { id: input.paymentId },
      data: {
        status: "PAID",
        reference: input.reference,
        subscriptionId: subscription.id,
        provider: input.provider ?? "MANUAL",
      },
    });
  } else {
    await prisma.payment.create({
      data: {
        businessId: input.businessId,
        subscriptionId: subscription.id,
        amountPaise: plan.amountPaise,
        currency: plan.currency,
        status: "PAID",
        provider: input.provider ?? "MANUAL",
        reference: input.reference,
        note: "Marked paid by an admin after a payment reference was recorded.",
      },
    });
  }

  if (business.status === "SUSPENDED") {
    await prisma.business.update({ where: { id: business.id }, data: { status: "ACTIVE" } });
  }

  await audit(input.actorId, "subscription.activate", "Subscription", subscription.id, {
    reference: input.reference,
  });
  return subscription;
}

export async function extendAccess(businessId: string, days: number, actorId: string, now = new Date()) {
  const subscription = await prisma.subscription.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  const trial = await prisma.trial.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  if (!subscription) throw new Error("No subscription to extend.");

  if (subscription.status === "TRIAL" || (subscription.paymentStatus !== "PAID" && subscription.status !== "ACTIVE")) {
    const base = subscription.trialEnd && subscription.trialEnd > now ? subscription.trialEnd : now;
    const trialEnd = addDays(base, days);
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "TRIAL", trialEnd, paymentStatus: subscription.paymentStatus },
    });
    if (trial) {
      await prisma.trial.update({
        where: { id: trial.id },
        data: { endDate: trialEnd, extendedBy: trial.extendedBy + days, isDisabled: false },
      });
    }
    await audit(actorId, "trial.extend", "Trial", trial?.id ?? subscription.id, { days });
    return;
  }

  const base = subscription.endDate && subscription.endDate > now ? subscription.endDate : now;
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "ACTIVE", endDate: addDays(base, days) },
  });
  await audit(actorId, "subscription.extend", "Subscription", subscription.id, { days });
}

export async function suspendBusiness(businessId: string, actorId: string) {
  await prisma.business.update({ where: { id: businessId }, data: { status: "SUSPENDED" } });
  const subscription = await prisma.subscription.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  if (subscription && subscription.status !== "CANCELLED") {
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "SUSPENDED" } });
  }
  await audit(actorId, "business.suspend", "Business", businessId);
}

export async function unsuspendBusiness(businessId: string, actorId: string, now = new Date()) {
  const subscription = await prisma.subscription.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  const trial = await prisma.trial.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  await prisma.business.update({ where: { id: businessId }, data: { status: "ACTIVE" } });
  if (subscription) {
    const status = restoredStatus({
      now,
      trialEnd: trial?.endDate ?? subscription.trialEnd,
      endDate: subscription.endDate,
      paymentStatus: subscription.paymentStatus,
      trialDisabled: trial?.isDisabled ?? false,
    });
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status } });
  }
  await audit(actorId, "business.unsuspend", "Business", businessId);
}

export async function disableTrial(businessId: string, actorId: string) {
  const trial = await prisma.trial.findFirst({ where: { businessId }, orderBy: { createdAt: "desc" } });
  const subscription = await prisma.subscription.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
  if (trial) await prisma.trial.update({ where: { id: trial.id }, data: { isDisabled: true } });
  if (subscription?.status === "TRIAL") {
    await prisma.subscription.update({ where: { id: subscription.id }, data: { status: "EXPIRED" } });
  }
  await audit(actorId, "trial.disable", "Trial", trial?.id ?? businessId);
}

export async function archiveBusiness(businessId: string, actorId: string) {
  await prisma.$transaction([
    prisma.business.update({
      where: { id: businessId },
      data: { status: "DEACTIVATED", deletedAt: new Date() },
    }),
    prisma.place.updateMany({ where: { businessId }, data: { isActive: false, deletedAt: new Date() } }),
    prisma.qrCode.updateMany({
      where: { place: { businessId } },
      data: { isActive: false, deletedAt: new Date() },
    }),
  ]);
  await audit(actorId, "business.archive", "Business", businessId);
}
