import { landSchemaForm } from "@/database/schemas/landSchemaFormSchema"
import { eq } from "drizzle-orm"
import { db } from "./connection"

type LandSchemaForm = {
	id: number
	type_form_id: number
	is_active: number
	schema: any
}

// Função para buscar os schemas de formulários no banco de dados
export async function getDatabaseLandSchemaForms(): Promise<LandSchemaForm[]> {
	try {
		const response = await db.select().from(landSchemaForm)

		return response
	} catch (error) {
		console.log("getDatabaseLandSchemaForms error =>", error)
		return []
	}
}

export async function getDatabaseLandSchemaForm(id: number): Promise<LandSchemaForm> {
	try {
		const response = await db
			.select()
			.from(landSchemaForm)
			.where(eq(landSchemaForm.type_form_id, id))
			.limit(1)

		const item = response[0]

		if (!item) {
			return [] as any
		}

		return {
			id: item.id,
			type_form_id: item.type_form_id,
			is_active: item.is_active,
			schema: JSON.parse(item.schema),
		}
	} catch (error) {
		console.log("getDatabaseLandSchemaForm error =>", error)
		return [] as any
	}
}

// Função para deletar e adicionar no banco o Schema do formulário
export async function delDatabaseLandSchemaForm(data: LandSchemaForm[]) {
	try {
		db.delete(landSchemaForm).run()
		db.insert(landSchemaForm).values(data).run()
	} catch (error) {
		console.log("delDatabaseLandSchemaForm error =>" + error)
	}
}
