import * as fundiaryUseType from "@/database/schemas/fundiaryUseTypeSchema";
import { tableFundiaryUseType } from "./connection";

// Função para buscar os tipos de uso fundiário
export async function getDatabaseFundiaryUseType() {
    try {
        const response = await tableFundiaryUseType.query.fundiaryUseType.findMany()
        return response
    } catch (error) {
        console.log("getDatabaseFundiaryUseType error =>" + error);
    }
}
// Função para deletar e adicionar os tipos de uso fundiário
export async function delDatabaseFundiaryUseType(data: any) {
    try {
        tableFundiaryUseType.delete(fundiaryUseType.fundiaryUseType).run();
        tableFundiaryUseType.insert(fundiaryUseType.fundiaryUseType).values(data).run();
    } catch (error) {
        console.log("delDatabaseFundiaryUseType error =>" + error);
    }
}