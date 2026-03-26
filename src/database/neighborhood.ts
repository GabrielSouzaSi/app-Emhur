import { neighborhood } from "@/database/schemas/neighborhoodSchema";
import { db } from "./connection";

// Função para buscar no banco os bairros
export async function getDatabaseNeighborhood() {
    try {
        const response = await db.select().from(neighborhood);
        return response
    } catch (error) {
        console.log("getDatabaseNeighborhood error =>" + error);
    }
}
// Função para deletar no banco os bairros
export async function delDatabaseNeighborhood(data: any) {
    try {
        db.delete(neighborhood).run();
        db.insert(neighborhood).values(data).run();
    } catch (error) {
        console.log("delDatabaseNeighborhood error =>" + error);
    }
}