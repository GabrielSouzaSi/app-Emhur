import { fundiaryUseType } from "@/database/schemas/fundiaryUseTypeSchema";
import { db } from "./connection";

// Função para buscar os tipos de uso fundiário
export async function getDatabaseFundiaryUseType() {
    try {
        const response = await db.select().from(fundiaryUseType);
        return response
    } catch (error) {
        console.log("getDatabaseFundiaryUseType error =>" + error);
    }
}
// Função para deletar e adicionar os tipos de uso fundiário
export async function delDatabaseFundiaryUseType(data: any) {
    try {
        db.delete(fundiaryUseType).run();
        db.insert(fundiaryUseType).values(data).run();
    } catch (error) {
        console.log("delDatabaseFundiaryUseType error =>" + error);
    }
}