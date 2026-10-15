import {
	inspections,
	type NewOfflineInspection,
	type StoredOfflineInspection,
} from "@/database/schemas/inspectionsSchema"
import { eq } from "drizzle-orm"
import { db } from "./connection"

export type DatabaseInspection = StoredOfflineInspection

// Função para buscar as vistorias no banco 
export async function getDatabaseInspections(): Promise<DatabaseInspection[]> {
	try {
		return await db.select().from(inspections)
	} catch (error) {
		console.log("getDatabaseInspections error =>" + error)
		return []
	}
}
// Função para deletar no banco a vistoria por ID
export async function delDatabaseInspectionId(id: number) {
	try {
		await db.delete(inspections).where(eq(inspections.id, id))
		return true
	} catch (error) {
		console.log("delDatabaseInspectionId error =>" + error)
		return false
	}
}
// Função para adicionar no banco a vistoria
export async function addDatabaseInspection(data: NewOfflineInspection) {
	try {
		await db.insert(inspections).values(data).run()
		return true
	} catch (error) {
		console.log("addDatabaseInspection error =>" + error)
		return false
	}
}
