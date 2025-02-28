// schema da tabela Products

// comando para gerar a tabela
// npx drizzle-kit generate

import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inspections = sqliteTable("inspections", {
    id: integer("id").primaryKey(),
    permitHolderId: text("permitHolderId"),
    vehicle: text("vehicle"), // placa ou numero
    inspectionLocationId: text("inspectionLocationId"),
    inspectionReasonId: text("inspectionReasonId"),
    data: text("data"),
    hora: text("hora"),
    advertising: text("advertising"),
    obs: text("obs"),
    items: text('items', { mode: "json" })
    .$type<string[]>()
    .default(sql`(json_array())`),
    imagens: text('imagens', { mode: 'json' })
        .$type<string[]>()
        .default(sql`(json_array())`),
    status: text("status")
})