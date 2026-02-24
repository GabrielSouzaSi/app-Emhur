import { tableFundiaryInspection } from "./connection";
import * as fundiaryInspections from "./schemas/fundiaryInspectionsSchema";

// Função para buscar os tipos de uso fundiário
export async function getDatabaseFundiaryInspection() {
    try {
        const response = await tableFundiaryInspection.query.fundiaryInspections.findMany()
        return response
    } catch (error) {
        console.log("getDatabaseFundiaryInspection error =>" + error);
    }
}
// Função para deletar e adicionar os tipos de uso fundiário
export async function delDatabaseFundiaryInspection(data: any) {
    console.log("delDatabaseFundiaryInspection data =>", data);

    try {
        tableFundiaryInspection.delete(fundiaryInspections.fundiaryInspections).run();
        tableFundiaryInspection.insert(fundiaryInspections.fundiaryInspections).values(data).run();
    } catch (error) {
        console.log("delDatabaseFundiaryInspection error =>" + error);
    }
}