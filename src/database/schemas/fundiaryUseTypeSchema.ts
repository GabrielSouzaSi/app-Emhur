// comando para gerar a tabela
// npx drizzle-kit generate

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const fundiaryUseType = sqliteTable("fundiaryUseType", {
    id: integer("id").primaryKey(),
    name: text("name")
})