import { inspections } from "@/database/schemas/inspectionsSchema";
import { eq } from "drizzle-orm";
import { db } from "./connection";

// Função para buscar as vistorias no banco 
export async function getDatabaseInspections() {
  try {
    const response = await db.select().from(inspections);
    return response
  } catch (error) {
    console.log("getDatabaseViolations error =>" + error);
  }
}
// Função para deletar no banco a vistoria por ID
export async function delDatabaseInspectionId(id: number) {
  try {
    await db.delete(inspections).where(eq(inspections.id, id));
    return true
  } catch (error) {
    console.log("delDatabaseViolationId error =>" + error);
  }
}
// Função para adicionar no banco a vistoria
export async function addDatabaseInspection(data: any) {
  try {
    db.insert(inspections).values(data).run();
    return true
  } catch (error) {
    console.log("addDatabaseViolation error =>" + error);
  }
}