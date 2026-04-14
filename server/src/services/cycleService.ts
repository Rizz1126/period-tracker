import { and, desc, eq } from 'drizzle-orm/sql';
import { db } from '../db/client.js';
import { cycles } from '../db/schema.js';

export async function getCyclesByUser(userId: number) {
  return db.select().from(cycles).where(eq(cycles.userId, userId)).orderBy(desc(cycles.startDate));
}

export async function getActiveCycle(userId: number) {
  return db
    .select()
    .from(cycles)
    .where(eq(cycles.userId, userId))
    .orderBy(desc(cycles.startDate))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

export async function createCycle(userId: number, data: {
  startDate: string;
  endDate?: string;
  averageLength?: number;
  flowIntensity?: string;
  notes?: string;
}) {
  const [created] = await db
    .insert(cycles)
    .values({
      userId,
      startDate: data.startDate,
      endDate: data.endDate,
      averageLength: data.averageLength ?? 28,
      flowIntensity: data.flowIntensity ?? 'moderate',
      notes: data.notes,
    })
    .returning();

  return created;
}

export async function updateCycle(cycleId: number, userId: number, data: Partial<{
  endDate: string;
  averageLength: number;
  flowIntensity: string;
  notes: string;
}>) {
  const [updated] = await db
    .update(cycles)
    .set(data)
    .where(and(eq(cycles.id, cycleId), eq(cycles.userId, userId)))
    .returning();

  return updated;
}
