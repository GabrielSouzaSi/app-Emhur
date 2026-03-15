import { fundiaryOccupationType } from "@/database/schemas/fundiaryOccupationTypeSchema";
import { db } from "./connection";

// Função para buscar os tipos de ocupação fundiária
export async function getDatabaseFundiaryOccupationType() {
    try {
        const response = await db.select().from(fundiaryOccupationType);
        return response
    } catch (error) {
        console.log("getDatabaseFundiaryOccupationType error =>" + error);
    }
}
// Função para deletar e adicionar os tipos de ocupação fundiária
export async function delDatabaseFundiaryOccupationType(data: any) {
    try {
        db.delete(fundiaryOccupationType).run();
        db.insert(fundiaryOccupationType).values(data).run();
    } catch (error) {
        console.log("delDatabaseFundiaryOccupationType error =>" + error);
    }
}