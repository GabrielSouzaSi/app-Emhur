import * as fundiaryOccupationType from "@/database/schemas/fundiaryOccupationTypeSchema";
import { tableFundiaryOccupationType } from "./connection";

// Função para buscar os tipos de ocupação fundiária
export async function getDatabaseFundiaryOccupationType() {
    try {
        const response = await tableFundiaryOccupationType.query.fundiaryOccupationType.findMany()
        return response
    } catch (error) {
        console.log("getDatabaseFundiaryOccupationType error =>" + error);
    }
}
// Função para deletar e adicionar os tipos de ocupação fundiária
export async function delDatabaseFundiaryOccupationType(data: any) {
    try {
        tableFundiaryOccupationType.delete(fundiaryOccupationType.fundiaryOccupationType).run();
        tableFundiaryOccupationType.insert(fundiaryOccupationType.fundiaryOccupationType).values(data).run();
    } catch (error) {
        console.log("delDatabaseFundiaryOccupationType error =>" + error);
    }
}