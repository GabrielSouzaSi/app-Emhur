import * as reasonsSchema from "@/database/schemas/reasonsSchema"
import { tableReason } from "./connection";
import { eq } from "drizzle-orm";

// Função para buscar no banco os motivos da vistoria
export async function getDatabaseReason() {
    try {
        const response = await tableReason.query.reasons.findMany();

        return response
    } catch (error) {
        console.log("getDatabaseReason error =>" + error);
    }
}
// Função para buscar os items do motivo por ID
export async function getDatabaseReasonItemId(id: number) {
    try {
        const response = await tableReason.query.reasons.findMany({ where: eq(reasonsSchema.reasons.id, id) });
        // Retorna apenas os itens
        return response.map((reason) => reason.items).flat();
    } catch (error) {
        console.log("getDatabaseReasonItemId error =>" + error);
    }
}
// Função para buscar o motivo por ID
export async function getDatabaseReasonId(id: number) {
    try {
        const [response] = await tableReason.query.reasons.findMany({ where: eq(reasonsSchema.reasons.id, id), limit: 1 });
        // Retorna apenas os itens
        if (!response) return null;
        return response ?? null;
    } catch (error) {
        console.log("getDatabaseReasonItemId error =>" + error);
    }
}
// Função para deletar no banco os motivos da vistoria
export async function delDatabaseReason(data: any) {
    try {
        tableReason.delete(reasonsSchema.reasons).run();
        tableReason.insert(reasonsSchema.reasons).values(data).run();
    } catch (error) {
        console.log("delAddDatabaseReason error =>" + error);
    }
}