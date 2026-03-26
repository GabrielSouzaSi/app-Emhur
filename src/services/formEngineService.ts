// src/services/formEngineService.ts
import { db } from "@/database/connection"
import { formEntries } from "@/database/schemas/formEntriesSchema"
import { formMedia } from "@/database/schemas/formMediaSchema"
import type { FormSchema } from "@/dtos/formTypes"
import { server } from "@/server/api"
import { buildFormDataFromSchema, extractPayloadAndFiles } from "@/utils/formSubmission"
import { eq } from "drizzle-orm"

type OfflineEntryParams = {
    schema: FormSchema
    values: Record<string, any>
    entryId?: number
    errorMessage?: string | null
}

const FORCE_OFFLINE_IN_DEV = true

export async function submitFormOnline(schema: FormSchema, values: Record<string, any>) {
    const formData = buildFormDataFromSchema(schema, values)
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
    errorMessage,
}: OfflineEntryParams) {
    const now = new Date().toISOString()

    console.log("saveOfflineEntry:start", { entryId, schemaId: schema.id })

    const baseData = {
        schemaId: schema.id,
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
    entryId?: number,
) {
    try {
        const response = await submitFormOnline(schema, values)

        if (entryId) {
            try {
                await deleteOfflineEntry(entryId)
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
            error?.response?.data?.message ||
            error?.message ||
            "Falha ao enviar formulário."

        const savedEntryId = await saveOfflineEntry({
            schema,
            values,
            entryId,
            errorMessage: message,
        })

        return {
            mode: "offline" as const,
            entryId: savedEntryId,
            errorMessage: message,
        }
    }
}

export async function deleteOfflineEntry(entryId: number) {
    await db.delete(formMedia).where(eq(formMedia.formEntryId, entryId))
    await db.delete(formEntries).where(eq(formEntries.id, entryId))
}

async function replaceMedia(
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