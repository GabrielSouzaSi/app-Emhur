import * as inspectionsSchema from "@/database/schemas/inspectionsSchema";
import { tableInspections } from "./connection";
import { eq } from "drizzle-orm";

// Função para buscar as vistorias no banco 
export async function getDatabaseInspections() {
    try {
        const response = await tableInspections.query.inspections.findMany()
        return response
    } catch (error) {
        console.log("getDatabaseViolations error =>" + error);
    }
}
// Função para deletar no banco a vistoria por ID
export async function delDatabaseInspectionId(id: number) {
    try {
        await tableInspections.delete(inspectionsSchema.inspections).where(eq(inspectionsSchema.inspections.id, id));
        return true   
      } catch (error) {
        console.log("delDatabaseViolationId error =>" + error);
      }
}
// Função para adicionar no banco a vistoria
export async function addDatabaseInspection(data: any) {
    try {
        tableInspections.insert(inspectionsSchema.inspections).values(data).run();
        return true   
      } catch (error) {
        console.log("addDatabaseViolation error =>" + error);
      }
}