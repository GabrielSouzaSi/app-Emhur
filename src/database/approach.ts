import * as approachSchema from "@/database/schemas/approachSchema"
import { tableApproach } from "./connection";

// Função para buscar no banco o modo de abordagem
export async function getDatabaseApproach() {
    try {
        const response = await tableApproach.query.approach.findMany()
        return response
    } catch (error) {
        console.log("getDatabaseApproach error =>" + error);
    }
}
// Função para deletar no banco o modo de abordagem
export async function delDatabaseApproach(data: any) {
    try {
        tableApproach.delete(approachSchema.approach).run();
        tableApproach.insert(approachSchema.approach).values(data).run();
    } catch (error) {
        console.log("delDatabaseApproach error =>" + error);
    }
}