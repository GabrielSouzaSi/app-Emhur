// src/database/schemas/formEntriesSchema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const formEntries = sqliteTable("form_entries", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	type_form_id: integer("type_form_id").notNull(),
	schemaId: text("schema_id").notNull(),
	schemaVersion: text("schema_version"),
	title: text("title"),
	endpoint: text("endpoint").notNull(),
	data: text("data").notNull(), // JSON string
	errorMessage: text("error_message"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
})
