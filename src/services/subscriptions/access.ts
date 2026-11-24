export type AccessState =
  | "ACTIVE"
  | "TRIAL"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED"
  | "DEACTIVATED"
  | "NONE";

export type AccessInput = {
  now: Date;
  businessStatus: string;
  trial: { endDate: Date; isDisabled: boolean } | null;
  subscription: {
    status: string;
    endDate: Date | null;
    trialEnd: Date | null;
    paymentStatus: string;
  } | null;
};

export type AccessDecision = {
  allowed: boolean;
  state: AccessState;
  endsAt: Date | null;
  reason: string;
};

export function evaluateAccess(input: AccessInput): AccessDecision {
  if (input.businessStatus === "SUSPENDED") {
    return {
      allowed: false,
      state: "SUSPENDED",
      endsAt: input.subscription?.endDate ?? null,
      reason: "This business is suspended.",
    };
  }

  if (input.businessStatus === "DEACTIVATED" || input.businessStatus !== "ACTIVE") {
    return {
      allowed: false,
      state: "DEACTIVATED",
      endsAt: null,
      reason: "This business is not active.",
    };
  }

  const subscription = input.subscription;
  if (!subscription) {
    return {
      allowed: false,
      state: "NONE",
      endsAt: null,
      reason: "No subscription is on file.",
    };
  }

  if (subscription.status === "SUSPENDED") {
    return {
      allowed: false,
      state: "SUSPENDED",
      endsAt: subscription.endDate,
      reason: "The subscription is suspended.",
    };
  }

  if (subscription.status === "CANCELLED") {
    return {
      allowed: false,
      state: "CANCELLED",
      endsAt: subscription.endDate,
      reason: "The subscription is cancelled.",
    };
  }

  if (subscription.status === "ACTIVE") {
    const paid = subscription.paymentStatus === "PAID";
    const open = Boolean(subscription.endDate && subscription.endDate > input.now);
    if (paid && open) {
      return {
        allowed: true,
        state: "ACTIVE",
        endsAt: subscription.endDate,
        reason: "The paid plan is active.",
      };
    }
    return {
      allowed: false,
      state: "EXPIRED",
      endsAt: subscription.endDate,
      reason: "The paid plan has expired.",
    };
  }

  const trialEnd = input.trial?.endDate ?? subscription.trialEnd;
  const trialDisabled = input.trial?.isDisabled ?? false;
  if (trialDisabled) {
    return {
      allowed: false,
      state: "EXPIRED",
      endsAt: trialEnd,
      reason: "Trial access is turned off.",
    };
  }

  if (subscription.status === "TRIAL" && trialEnd && trialEnd > input.now) {
    return {
      allowed: true,
      state: "TRIAL",
      endsAt: trialEnd,
      reason: "The free trial is active.",
    };
  }

  return {
    allowed: false,
    state: "EXPIRED",
    endsAt: trialEnd ?? subscription.endDate,
    reason: "The trial or plan has ended.",
  };
}

export function restoredStatus(input: {
  now: Date;
  trialEnd: Date | null;
  endDate: Date | null;
  paymentStatus: string;
  trialDisabled: boolean;
}): "ACTIVE" | "TRIAL" | "EXPIRED" {
  if (input.paymentStatus === "PAID" && input.endDate && input.endDate > input.now) {
    return "ACTIVE";
  }
  if (!input.trialDisabled && input.trialEnd && input.trialEnd > input.now) {
    return "TRIAL";
  }
  return "EXPIRED";
}
