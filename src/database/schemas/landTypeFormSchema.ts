// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const landTypeForm = sqliteTable("landTypeForms", {
	id: integer("id").primaryKey(),
	name: text("name"),
	description: text("description"),
})
