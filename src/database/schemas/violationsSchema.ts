// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const violations = sqliteTable("violations", {
    id: integer("id").primaryKey(),
    vehicle: text("vehicle"), // placa ou numero
    imagens: text('imagens', { mode: 'json' })
    .$type<string[]>()
    .default(sql`(json_array())`),
    local: text("local"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    data: text("data"),
    hora: text("hora"),
    approach: integer("approach"),
    idInfracao: integer("idInfracao"),
    obs: text("obs"),
    status: text("status")
})