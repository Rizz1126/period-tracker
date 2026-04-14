import { and, asc, desc, eq } from 'drizzle-orm/sql';
import { db } from '../db/client.js';
import { dailyLogs } from '../db/schema.js';

export async function getLogsForCycle(userId: number, cycleId: number) {
  return db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.cycleId, cycleId)))
    .orderBy(asc(dailyLogs.logDate));
}

export async function createDailyLog(userId: number, cycleId: number, data: {
  logDate: string;
  mood?: string;
  symptoms?: string[];
  flow?: string;
  temperature?: string;
  note?: string;
}) {
  const [created] = await db
    .insert(dailyLogs)
    .values({
      userId,
      cycleId,
      logDate: data.logDate,
      mood: data.mood,
      symptoms: data.symptoms ?? [],
      flow: data.flow ?? 'none',
      temperature: data.temperature,
      note: data.note,
    })
    .returning();

  return created;
}

export async function getLogsForUser(userId: number) {
  return db.select().from(dailyLogs).where(eq(dailyLogs.userId, userId)).orderBy(desc(dailyLogs.logDate));
}
