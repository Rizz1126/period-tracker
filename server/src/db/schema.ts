import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const cycles = pgTable('cycles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  averageLength: integer('average_length').notNull().default(28),
  flowIntensity: varchar('flow_intensity', { length: 20 }).notNull().default('moderate'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dailyLogs = pgTable('daily_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  cycleId: integer('cycle_id').notNull().references(() => cycles.id),
  logDate: date('log_date').notNull(),
  mood: varchar('mood', { length: 50 }),
  symptoms: jsonb('symptoms').notNull().default([]),
  flow: varchar('flow', { length: 20 }).notNull().default('none'),
  temperature: varchar('temperature', { length: 20 }),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  preferredCycleLength: integer('preferred_cycle_length').notNull().default(28),
  preferredLutealLength: integer('preferred_luteal_length').notNull().default(14),
  notificationsEnabled: boolean('notifications_enabled').notNull().default(true),
  timezone: varchar('timezone', { length: 100 }).default('UTC'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
