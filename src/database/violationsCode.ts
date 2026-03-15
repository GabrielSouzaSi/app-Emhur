import { violationsCode } from "@/database/schemas/violationsCodeSchema";
import { db } from "./connection";

// Função para adicionar no banco os motivos da vistoria
export async function getDatabaseViolationCode() {
    try {
        const response = await db.select().from(violationsCode);

        return response
    } catch (error) {
        console.log("getDatabaseViolationCode error =>" + error);
    }
}
// Função para deletar no banco os motivos da vistoria
export async function delDatabaseViolationCode(data: any) {
    try {
        db.delete(violationsCode).run();
        db.insert(violationsCode).values(data).run();
    } catch (error) {
        console.log("delDatabaseViolationCode error =>" + error);
    }
}