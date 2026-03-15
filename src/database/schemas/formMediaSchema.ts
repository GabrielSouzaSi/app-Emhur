// src/database/schemas/formMediaSchema.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const formMedia = sqliteTable("form_media", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    formEntryId: integer("form_entry_id").notNull(),
    fieldName: text("field_name").notNull(),
    uri: text("uri").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    createdAt: text("created_at").notNull(),
})