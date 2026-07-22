import { landTypeForm } from "@/database/schemas/landTypeFormSchema"
import { db } from "./connection"

type TypeForm = {
	id: number
	name?: string
	description?: string
}

// Função para buscar os tipos de formulários no banco de dados
export async function getDatabaseLandTypeForms(): Promise<TypeForm[]> {
	try {
		const response = await db.select().from(landTypeForm)

		return response.map((item) => ({
			id: item.id,
			name: item.name ?? undefined,
			description: item.description ?? undefined,
		}))
	} catch (error) {
		console.log("getDatabaseFundiaryTypeForms error =>", error)
		return []
	}
}

// Função para deletar e adicionar no banco o tipo de formulário
export async function delDatabaseLandTypeForm(data: any) {
	try {
		db.delete(landTypeForm).run()
		db.insert(landTypeForm).values(data).run()
	} catch (error) {
		console.log("delDatabaseLandTypeForm error =>" + error)
	}
}
