// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reasons = sqliteTable("reasons", {
    id: integer("id").primaryKey(),
    name: text("name"),
    items: text('items', { mode: 'json' })
    .$type<string[]>()
    .default(sql`(json_array())`)
})