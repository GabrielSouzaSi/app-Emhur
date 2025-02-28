import * as violationsCodeSchema from "@/database/schemas/violationsCodeSchema"
import { tableViolationsCode } from "./connection";

// Função para adicionar no banco os motivos da vistoria
export async function getDatabaseViolationCode() {
    try {
        const response = await tableViolationsCode.query.violationsCode.findMany()

        return response
    } catch (error) {
        console.log("getDatabaseViolationCode error =>" + error);
    }
}
// Função para deletar no banco os motivos da vistoria
export async function delDatabaseViolationCode(data: any) {
    try {
        tableViolationsCode.delete(violationsCodeSchema.violationsCode).run();
        tableViolationsCode.insert(violationsCodeSchema.violationsCode).values(data).run();
    } catch (error) {
        console.log("delDatabaseViolationCode error =>" + error);
    }
}