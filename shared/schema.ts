import { pgTable, text, serial, integer, boolean, timestamp, numeric, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  isOrganizer: boolean("is_organizer").default(false).notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Event model
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  organizedById: integer("organized_by_id").notNull(),
  featured: boolean("featured").default(false).notNull(),
  tags: text("tags").array().notNull(),
});

// Create a base schema with omitted fields
const baseInsertEventSchema = createInsertSchema(events).omit({
  id: true,
});

// Create a modified schema that transforms the date field
export const insertEventSchema = baseInsertEventSchema.extend({
  date: z.preprocess(
    (arg) => {
      if (typeof arg === 'string' || arg instanceof Date) {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

// Ticket types model
export const ticketTypes = pgTable("ticket_types", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  available: integer("available").notNull(),
});

// Create a base schema with omitted fields
const baseInsertTicketTypeSchema = createInsertSchema(ticketTypes).omit({
  id: true,
});

// Create a modified schema that handles numeric values 
export const insertTicketTypeSchema = baseInsertTicketTypeSchema.extend({
  price: z.preprocess(
    (arg) => typeof arg === 'string' ? parseFloat(arg) : arg,
    z.number()
  ),
  available: z.preprocess(
    (arg) => typeof arg === 'string' ? parseInt(arg) : arg,
    z.number()
  ),
});

// Performer model
export const performers = pgTable("performers", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  time: text("time").notNull(),
  isHeadliner: boolean("is_headliner").default(false),
});

export const insertPerformerSchema = createInsertSchema(performers).omit({
  id: true,
});

// Ticket model
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  eventId: integer("event_id").notNull(),
  ticketTypeId: integer("ticket_type_id").notNull(),
  quantity: integer("quantity").notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
  referenceNumber: text("reference_number").notNull().unique(),
  paymentDetails: json("payment_details").notNull(),
});

// Create a base schema with omitted fields
const baseInsertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  purchaseDate: true,
});

// Create a modified schema for ticket
export const insertTicketSchema = baseInsertTicketSchema.extend({
  // Add any additional field processing here if needed in the future
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertTicketType = z.infer<typeof insertTicketTypeSchema>;
export type TicketType = typeof ticketTypes.$inferSelect;

export type InsertPerformer = z.infer<typeof insertPerformerSchema>;
export type Performer = typeof performers.$inferSelect;

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;
