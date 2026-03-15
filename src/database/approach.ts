import * as approachSchema from "@/database/schemas/approachSchema";
import { db } from "./connection";
import { approach } from "./schemas/approachSchema";

// Função para buscar no banco o modo de abordagem
export async function getDatabaseApproach() {
    try {
        const response = await db.select().from(approach);
        return response
    } catch (error) {
        console.log("getDatabaseApproach error =>" + error);
    }
}
// Função para deletar no banco o modo de abordagem
export async function delDatabaseApproach(data: any) {
    try {
        db.delete(approachSchema.approach).run();
        db.insert(approachSchema.approach).values(data).run();
    } catch (error) {
        console.log("delDatabaseApproach error =>" + error);
    }
}