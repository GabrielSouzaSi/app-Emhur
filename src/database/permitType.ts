import { permitType } from "@/database/schemas/permitTypeSchema";
import { db } from "./connection";

// Função para buscar no banco o tipo de Alvará
export async function getDatabasePermitType() {
    try {
        const response = await db.select().from(permitType);
        return response
    } catch (error) {
        console.log("getDatabasePermitType error =>" + error);
    }
}
// Função para deletar no banco e adicionar o tipo de Alvará
export async function delDatabasePermitType(data: any) {
    try {
        db.delete(permitType).run();
        db.insert(permitType).values(data).run();
    } catch (error) {
        console.log("delDatabasePermitType error =>" + error);
    }
}