import { db } from "./connection";
import { fundiaryEnvironmentalInfluenceType } from "./schemas/fundiaryEnvironmentalInfluenceTypeSchema";

// Função para buscar os tipos de influência ambiental
export async function getDatabaseFundiaryEnvironmentalInfluenceType() {
    try {
        const response = await db.select().from(fundiaryEnvironmentalInfluenceType);
        return response
    } catch (error) {
        console.log("getDatabaseFundiaryEnvironmentalInfluenceType error =>" + error);
    }
}
// Função para deletar e adicionar os tipos de influência ambiental
export async function delDatabaseFundiaryEnvironmentalInfluenceType(data: any) {
    try {
        db.delete(fundiaryEnvironmentalInfluenceType).run();
        db.insert(fundiaryEnvironmentalInfluenceType).values(data).run();
    } catch (error) {
        console.log("delDatabaseFundiaryEnvironmentalInfluenceType error =>" + error);
    }
}