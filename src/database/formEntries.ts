import { formEntries } from "@/database/schemas/formEntriesSchema"
import { FormSchema } from "@/dtos/formTypes"
import { extractPayloadAndFiles } from "@/utils/formSubmission"
import { desc, eq } from "drizzle-orm"
import { db } from "./connection"
import { formMedia } from "./schemas/formMediaSchema"

type FormEntry = {
	id: number
	type_form_id: number
	schemaId: string
	endpoint: string
	data: any
	createdAt: string
	updatedAt: string
	schemaVersion?: string | null
	title?: string | null
	errorMessage?: string | null
}

// Função para buscar no banco os formulários fundiários
export async function getDatabaseFormEntries(): Promise<FormEntry[]> {
	try {
		const response = await db.select().from(formEntries).orderBy(desc(formEntries.id))
		const data = response.map((item) => ({
			...item,
			data: JSON.parse(item.data),
		}))
		return data ?? []
	} catch (error) {
		console.log("getDatabaseFormEntries error =>" + error)
		return []
	}
}
// Função para buscar no banco os dados do formulário fundiário por id
export async function getDatabaseFormEntrieId(id: number): Promise<FormEntry> {
	try {
		const response = await db.select().from(formEntries).where(eq(formEntries.id, id)).limit(1)

		const item = response[0]

		if (!item) {
			return [] as any
		}

		return {
			...item,
			data: JSON.parse(item.data),
		}
	} catch (error) {
		console.log("getDatabaseFormEntries error =>" + error)
		return [] as any
	}
}
// Função para deletar o formulário por ID
export async function delDatabaseFormEntriesId(id: number) {
	try {
		await db.delete(formMedia).where(eq(formMedia.formEntryId, id))
		await db.delete(formEntries).where(eq(formEntries.id, id))
		return true
	} catch (error) {
		console.log("delDatabaseFormEntriesId error =>" + error)
	}
}
// Função para adicionar no banco os dados do formulário
export async function addDatabaseFormEntries(data: any) {
	try {
		db.insert(formEntries).values(data).run()
		return true
	} catch (error) {
		console.log("addDatabaseFormEntries error =>" + error)
	}
}
// Função para atualizar no banco os dados do formulário
export async function updateDatabaseFormEntries(
	id: number,
	schema: FormSchema,
	values: Record<string, any>,
	errorMessage?: string | null,
) {
	try {
		const now = new Date().toISOString()
		await db
			.update(formEntries)
			.set({
				data: JSON.stringify(values),
				errorMessage: errorMessage ?? null,
				updatedAt: now,
			})
			.where(eq(formEntries.id, id))

		await replaceMedia(id, schema, values)
		return true
	} catch (error) {
		console.log("updateDatabaseFormEntries error =>" + error)
		return false
	}
}

// Função para substituir as mídias vinculadas ao formulário
export async function replaceMedia(
	formEntryId: number,
	schema: FormSchema,
	values: Record<string, any>,
) {
	await db.delete(formMedia).where(eq(formMedia.formEntryId, formEntryId))

	const { files } = extractPayloadAndFiles(schema, values)
	const now = new Date().toISOString()

	if (!files.length) return

	await db.insert(formMedia).values(
		files.map((item) => ({
			formEntryId,
			fieldName: item.fieldName,
			uri: item.file.uri,
			name: item.file.name,
			type: item.file.type,
			createdAt: now,
		})),
	)
}
