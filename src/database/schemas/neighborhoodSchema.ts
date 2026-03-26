// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const neighborhood = sqliteTable("neighborhoods", {
    id: integer("id").primaryKey(),
    name: text("code")
})