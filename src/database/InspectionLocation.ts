import * as inspectionLocationsSchema from "@/database/schemas/InspectionLocationsSchema"
import { tableInspectionLocations } from "./connection";

// Função para buscar os locais da vistoria
export async function getDatabaseInspectionLocation() {
    try {
        const response = await tableInspectionLocations.query.inspectionLocations.findMany()
        return response
    } catch (error) {
        console.log("getDatabaseInspectionLocation error =>" + error);
    }
}
// Função para deletar e adicionar os locais da vistoria
export async function delDatabaseInspectionLocation(data: any) {
    try {
        tableInspectionLocations.delete(inspectionLocationsSchema.inspectionLocations).run();
        tableInspectionLocations.insert(inspectionLocationsSchema.inspectionLocations).values(data).run();
    } catch (error) {
        console.log("delDatabaseInspectionLocation error =>" + error);
    }
}