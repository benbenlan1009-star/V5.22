import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const links = pgTable('links', {
  id: serial().primaryKey(),
  title: text().notNull(),
  url: text().notNull(),
  description: text().notNull().default(''),
  category: text().notNull().default('General'),
  submittedBy: text('submitted_by').notNull().default('Visitor'),
  isIdea: boolean('is_idea').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const reviews = pgTable('reviews', {
  id: serial().primaryKey(),
  author: text().notNull(),
  rating: integer().notNull(),
  body: text().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

