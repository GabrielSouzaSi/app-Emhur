// src/services/formEngineService.ts
import { db } from "@/database/connection"
import { delDatabaseFormEntriesId, replaceMedia } from "@/database/formEntries"
import { formEntries } from "@/database/schemas/formEntriesSchema"
import type { FormSchema } from "@/dtos/formTypes"
import { server } from "@/server/api"
import { buildFormDataFromSchema } from "@/utils/formSubmission"
import { eq } from "drizzle-orm"

type OfflineEntryParams = {
	schema: FormSchema
	values: Record<string, any>
	entryId?: number
	errorMessage?: string | null
	type_form_id: number
}

const FORCE_OFFLINE_IN_DEV = true

export async function submitFormOnline(schema: FormSchema, values: Record<string, any>) {
	const formData = buildFormDataFromSchema(schema, values)
	//console.log(JSON.stringify(formData, null, 2))

	const response = await server.postForm(schema.endpoint, formData)
	if (__DEV__ && FORCE_OFFLINE_IN_DEV) {
		throw new Error("Simulação de modo offline para testes")
	}
	return response
}

export async function saveOfflineEntry({
	schema,
	values,
	entryId,
	type_form_id,
	errorMessage,
}: OfflineEntryParams) {
	const now = new Date().toISOString()

	console.log("saveOfflineEntry:start", { entryId, schemaId: schema.id })

	const baseData = {
		schemaId: schema.id,
		type_form_id,
		schemaVersion: schema.schemaVersion ?? null,
		title: schema.title ?? null,
		endpoint: schema.endpoint,
		data: JSON.stringify(values),
		errorMessage: errorMessage ?? null,
		updatedAt: now,
	}

	if (entryId) {
		await db.update(formEntries).set(baseData).where(eq(formEntries.id, entryId))
		await replaceMedia(entryId, schema, values)
		return entryId
	}

	const result = await db.insert(formEntries).values({
		...baseData,
		createdAt: now,
	})

	const insertedId = Number(result.lastInsertRowId)
	await replaceMedia(insertedId, schema, values)

	return insertedId
}

export async function submitOrStoreOffline(
	schema: FormSchema,
	values: Record<string, any>,
	type_form_id: number,
	entryId?: number,
) {
	console.log("schema \n" + JSON.stringify(schema, null, 2))
	console.log("values \n" + JSON.stringify(values, null, 2))

	try {
		const response = await submitFormOnline(schema, values)

		if (entryId) {
			try {
				await delDatabaseFormEntriesId(entryId)
			} catch (deleteError) {
				console.log("Erro ao remover pendência local após envio:", deleteError)
			}
		}

		return {
			mode: "online" as const,
			response,
		}
	} catch (error: any) {
		const message =
			error?.response?.data?.message || error?.message || "Falha ao enviar formulário."

		const savedEntryId = await saveOfflineEntry({
			schema,
			values,
			entryId,
			errorMessage: message,
			type_form_id,
		})

		return {
			mode: "offline" as const,
			entryId: savedEntryId,
			errorMessage: message,
		}
	}
}
