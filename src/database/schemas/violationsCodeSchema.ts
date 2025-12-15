// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const violationsCode = sqliteTable("violationsCode", {
    id: integer("id").primaryKey(),
    code: text("code"),
    description: text("description"),
    permitTypes: text("permit_types", { mode: "json" })
        .$type<{ id: number; name: string }[]>()
        .default(sql`(json_array())`),
})