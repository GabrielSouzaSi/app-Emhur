// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const approach = sqliteTable("approachs", {
    id: integer("id").primaryKey(),
    name: text("code")
})