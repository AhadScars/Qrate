import { prisma } from "@/lib/db/prisma";

export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  metadata?: Record<string, unknown>,
) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ? JSON.stringify(metadata).slice(0, 2000) : null,
    },
  });
}
