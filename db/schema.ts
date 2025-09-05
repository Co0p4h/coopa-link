import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const links = sqliteTable("links", {
  id: integer("id").primaryKey(),
  link_name: text("link").unique().notNull(),
  redirect_to: text("redirect_to").notNull(),
  visits: integer("clicks"),
});