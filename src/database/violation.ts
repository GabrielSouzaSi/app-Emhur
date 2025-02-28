import * as violationsSchema from "@/database/schemas/violationsSchema"
import { tableViolation } from "./connection";
import { eq } from "drizzle-orm";

// Função para buscar no banco as autuações
export async function getDatabaseViolations() {
    try {
        const response = await tableViolation.query.violations.findMany()
        return response
    } catch (error) {
        console.log("getDatabaseViolations error =>" + error);
    }
}
// Função para deletar no banco a autuação por ID
export async function delDatabaseViolationId(id: number) {
    try {
        await tableViolation.delete(violationsSchema.violations).where(eq(violationsSchema.violations.id, id));
        return true   
      } catch (error) {
        console.log("delDatabaseViolationId error =>" + error);
      }
}
// Função para adicionar no banco a autuação
export async function addDatabaseViolation(data: any) {
    try {
        tableViolation.insert(violationsSchema.violations).values(data).run();
        return true   
      } catch (error) {
        console.log("addDatabaseViolation error =>" + error);
      }
}