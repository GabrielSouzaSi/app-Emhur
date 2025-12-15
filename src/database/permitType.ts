import * as permitTypeSchema from "@/database/schemas/permitTypeSchema";
import { tablePermitType } from "./connection";

// Função para buscar no banco o tipo de Alvará
export async function getDatabasePermitType() {
    try {
        const response = await tablePermitType.query.permitType.findMany()
        return response
    } catch (error) {
        console.log("getDatabasePermitType error =>" + error);
    }
}
// Função para deletar no banco e adicionar o tipo de Alvará
export async function delDatabasePermitType(data: any) {
    try {
        tablePermitType.delete(permitTypeSchema.permitType).run();
        tablePermitType.insert(permitTypeSchema.permitType).values(data).run();
    } catch (error) {
        console.log("delDatabasePermitType error =>" + error);
    }
}