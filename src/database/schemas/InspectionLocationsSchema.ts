// comando para gerar a tabela
// npx drizzle-kit generate

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inspectionLocations = sqliteTable("inspectionLocations", {
    id: integer("id").primaryKey(),
    name: text("name")
})