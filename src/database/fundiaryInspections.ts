import { eq } from "drizzle-orm";
import { db } from "./connection";
import { fundiaryInspections } from "./schemas/fundiaryInspectionsSchema";

// Função para buscar no banco as fiscalizações fundiárias
export async function getDatabaseFundiaryInspection() {
    try {
        const response = await db.select().from(fundiaryInspections);
        return response
    } catch (error) {
        //console.log("getDatabaseFundiaryInspection error =>" + error);
    }
}

// Função para buscar no banco as fiscalizações fundiárias por ID
export async function getDatabaseFundiaryInspectionById(id: number) {
    try {
        const response = await db.query.fundiaryInspections.findFirst({
            where: eq(fundiaryInspections.id, id)
        })
        return response
    } catch (error) {
        //console.log("getDatabaseFundiaryInspectionById error =>" + error);
        return null
    }
}

// Função para atualizar no banco as fiscalizações fundiárias por ID
export async function updateDatabaseFundiaryInspection(id: number, data: any) {
    try {
        const res = db.update(fundiaryInspections).set(data).where(eq(fundiaryInspections.id, id)).run()

        return res.changes > 0
    } catch (error) {
        console.log("updateDatabaseFundiaryInspection error =>", error)
        return false
    }
}

// Função para deletar no banco a fiscalização fundiária por ID
export async function delDatabaseFundiaryInspection(id: number) {
    //console.log("delDatabaseFundiaryInspection id =>", id);

    try {
        db.delete(fundiaryInspections).where(eq(fundiaryInspections.id, id)).run();
        return true
    } catch (error) {
        //console.log("delDatabaseFundiaryInspection error =>" + error);
        return false
    }
}

// Função para adicionar no banco a fiscalização fundiária
export async function addDatabaseFundiaryInspection(data: any) {
    try {
        db.insert(fundiaryInspections).values(data).run();
        return true
    } catch (error) {
        //console.log("addDatabaseFundiaryInspection error =>" + error);
        return false
    }
}