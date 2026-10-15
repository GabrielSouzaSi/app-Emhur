import type { ImageDTO } from "@/dtos/imageDTO"
import type { InspectionItemDTO } from "@/dtos/inspectionItemDTO"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export type OfflineInspection = {
	permitHolderId?: number
	vehicle: string
	newVehicle?: string
	inspectionLocationId: number
	inspectionReasonId: number
	data: string
	hora: string
	advertising: string
	obs: string
	items: InspectionItemDTO[]
	imagens: ImageDTO[]
	status: string
}

export const inspections = sqliteTable("inspections", {
	id: integer("id").primaryKey(),
	userId: integer("user_id").notNull(),
	inspection: text("inspection", { mode: "json" }).$type<OfflineInspection>().notNull(),
})

export type NewOfflineInspection = typeof inspections.$inferInsert
export type StoredOfflineInspection = typeof inspections.$inferSelect
