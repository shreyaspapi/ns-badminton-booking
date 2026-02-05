import { pgTable, text, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  discordUsername: text("discord_username").notNull(),
  discordAvatar: text("discord_avatar"),
  skillLevel: text("skill_level"),
  isAdmin: boolean("is_admin").notNull().default(false),
  hasCompletedOnboarding: boolean("has_completed_onboarding").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Players type for bookings
export type PlayerJson = {
  discordId: string;
  discordUsername: string;
  skillLevel: string;
};

// Bookings table
export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  timeSlot: text("time_slot").notNull(),
  gameType: text("game_type").notNull(), // "1v1" | "2v2"
  createdBy: text("created_by").notNull(), // discord username
  createdById: text("created_by_id").notNull(), // discord id
  playerCount: integer("player_count").notNull(),
  players: json("players").$type<PlayerJson[]>().notNull(),
  skillLevel: text("skill_level").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin usernames table
export const adminUsernames = pgTable("admin_usernames", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Unblocked core dates table (for 5:00-6:30 slot)
export const unblockedCoreDates = pgTable("unblocked_core_dates", {
  id: text("id").primaryKey(),
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type exports for use in the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type AdminUsername = typeof adminUsernames.$inferSelect;
export type UnblockedCoreDate = typeof unblockedCoreDates.$inferSelect;
