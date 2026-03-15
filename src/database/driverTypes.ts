import { driverType } from "@/database/schemas/driverTypeSchema";
import { db } from "./connection";

// Função para buscar no banco o tipo de condutor
export async function getDatabaseDriverType() {
    try {
        const response = await db.select().from(driverType);
        return response
    } catch (error) {
        console.log("getDatabaseDriverType error =>" + error);
    }
}
// Função para deletar no banco o tipo de condutor e adicionar os novos dados
export async function delDatabaseDriverType(data: any) {
    try {
        db.delete(driverType).run();
        db.insert(driverType).values(data).run();
    } catch (error) {
        console.log("delDatabaseDriverType error =>" + error);
    }
}