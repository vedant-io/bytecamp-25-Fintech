import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'donor' or 'ngo'
});

export const ngos = pgTable("ngos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  registrationNumber: text("registration_number").notNull(),
  sector: text("sector").notNull(),
  location: text("location").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone").notNull(),
  impactScore: decimal("impact_score").notNull().default("0"),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").notNull(),
  ngoId: integer("ngo_id").notNull(),
  amount: decimal("amount").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  ngoId: integer("ngo_id").notNull(),
  amount: decimal("amount").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull(), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertNgoSchema = createInsertSchema(ngos).omit({
  id: true,
  impactScore: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNgo = z.infer<typeof insertNgoSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;

export type User = typeof users.$inferSelect;
export type Ngo = typeof ngos.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Withdrawal = typeof withdrawals.$inferSelect;
