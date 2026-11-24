"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/guards";
import { businessProfileSchema, placeSchema, qrStyleSchema, zodError } from "@/lib/validation/schemas";
import { updateOwnerProfile } from "@/services/accounts/service";
import { addQrCode, archivePlace, createPlace, regenerateQr, setQrActive, updatePlace, updateQrStyle } from "@/services/places/service";
import { requestManualPayment } from "@/services/subscriptions/service";

export async function savePlaceAction(input: unknown & { placeId?: string }) {
  const owner = await requireOwner();
  const parsed = placeSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const placeId = typeof input === "object" && input && "placeId" in input ? String(input.placeId ?? "") : "";
  const result = placeId
    ? await updatePlace({ ...parsed.data, placeId, businessId: owner.business.id, actorId: owner.user.id })
    : await createPlace({ ...parsed.data, businessId: owner.business.id, actorId: owner.user.id });
  if (!result.ok) return result;
  revalidatePath("/dashboard/places");
  revalidatePath("/dashboard/qr-codes");
  revalidatePath("/dashboard/overview");
  return { ok: true as const, placeId: result.place.id };
}

export async function archivePlaceAction(placeId: string) {
  const owner = await requireOwner();
  const result = await archivePlace(owner.business.id, owner.user.id, placeId);
  revalidatePath("/dashboard/places");
  return result;
}

export async function addQrAction(placeId: string) {
  const owner = await requireOwner();
  const result = await addQrCode(owner.business.id, owner.user.id, placeId);
  revalidatePath("/dashboard/qr-codes");
  return result;
}

export async function saveQrStyleAction(input: unknown) {
  const owner = await requireOwner();
  const parsed = qrStyleSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  const result = await updateQrStyle({ ...parsed.data, businessId: owner.business.id, actorId: owner.user.id });
  revalidatePath("/dashboard/qr-codes");
  return result;
}

export async function setQrActiveAction(qrId: string, isActive: boolean) {
  const owner = await requireOwner();
  const result = await setQrActive(owner.business.id, owner.user.id, qrId, isActive);
  revalidatePath("/dashboard/qr-codes");
  return result;
}

export async function regenerateQrAction(qrId: string) {
  const owner = await requireOwner();
  const result = await regenerateQr(owner.business.id, owner.user.id, qrId);
  revalidatePath("/dashboard/qr-codes");
  return result;
}

export async function saveProfileAction(input: unknown) {
  const owner = await requireOwner();
  const parsed = businessProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: zodError(parsed.error) };
  await updateOwnerProfile(owner.user.id, owner.business.id, parsed.data);
  revalidatePath("/dashboard/settings");
  return { ok: true as const };
}

export async function requestPaymentAction() {
  const owner = await requireOwner();
  await requestManualPayment(owner.business.id, owner.user.id);
  revalidatePath("/dashboard/subscription");
  revalidatePath("/admin/payments");
  return { ok: true as const };
}
