import * as driverType from "@/database/schemas/driverTypeSchema";
import { tableDriverType } from "./connection";

// Função para buscar no banco o tipo de condutor
export async function getDatabaseDriverType() {
    try {
        const response = await tableDriverType.query.driverType.findMany()
        return response
    } catch (error) {
        console.log("getDatabaseDriverType error =>" + error);
    }
}
// Função para deletar no banco o tipo de condutor e adicionar os novos dados
export async function delDatabaseDriverType(data: any) {
    try {
        tableDriverType.delete(driverType.driverType).run();
        tableDriverType.insert(driverType.driverType).values(data).run();
    } catch (error) {
        console.log("delDatabaseDriverType error =>" + error);
    }
}