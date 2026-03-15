import { violations } from "@/database/schemas/violationsSchema";
import { eq } from "drizzle-orm";
import { db } from "./connection";

// Função para buscar no banco as autuações
export async function getDatabaseViolations() {
  try {
    const response = await db.select().from(violations);
    return response
  } catch (error) {
    console.log("getDatabaseViolations error =>" + error);
  }
}
// Função para deletar no banco a autuação por ID
export async function delDatabaseViolationId(id: number) {
  try {
    await db.delete(violations).where(eq(violations.id, id));
    return true
  } catch (error) {
    console.log("delDatabaseViolationId error =>" + error);
  }
}
// Função para adicionar no banco a autuação
export async function addDatabaseViolation(data: any) {
  try {
    db.insert(violations).values(data).run();
    return true
  } catch (error) {
    console.log("addDatabaseViolation error =>" + error);
  }
}