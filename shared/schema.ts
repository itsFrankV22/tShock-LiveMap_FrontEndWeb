import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Terraria-specific types for the LiveMap
export interface Player {
  name: string;
  x: number;
  y: number;
  active: boolean;
}

export interface ChatMessage {
  player: string;
  message: string;
  timestamp: string;
}

export interface MapChunk {
  x: number;
  y: number;
  data: Uint8Array;
}

export interface ConnectionStatus {
  connected: boolean;
  playerCount: number;
  ping?: number;
}
