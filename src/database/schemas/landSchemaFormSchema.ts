// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const landSchemaForm = sqliteTable("landSchemaForms", {
	id: integer("id").notNull(),
	type_form_id: integer("type_form_id").notNull(),
	is_active: integer("is_active").notNull(),
	schema: text("data").notNull(),
})
