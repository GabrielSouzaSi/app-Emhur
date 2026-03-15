import { inspectionLocations } from "@/database/schemas/InspectionLocationsSchema";
import { db } from "./connection";

// Função para buscar os locais da vistoria
export async function getDatabaseInspectionLocation() {
    try {
        const response = await db.select().from(inspectionLocations);
        return response
    } catch (error) {
        console.log("getDatabaseInspectionLocation error =>" + error);
    }
}
// Função para deletar e adicionar os locais da vistoria
export async function delDatabaseInspectionLocation(data: any) {
    try {
        db.delete(inspectionLocations).run();
        db.insert(inspectionLocations).values(data).run();
    } catch (error) {
        console.log("delDatabaseInspectionLocation error =>" + error);
    }
}