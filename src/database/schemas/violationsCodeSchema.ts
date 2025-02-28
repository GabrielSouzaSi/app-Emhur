// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const violationsCode = sqliteTable("violationsCode", {
    id: integer("id").primaryKey(),
    code: text("code"),
    description: text("description")
})