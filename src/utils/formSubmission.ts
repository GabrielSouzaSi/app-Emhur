// src/utils/formSubmission.ts
import type { FormSchema } from "@/dtos/formTypes"
import type { ImageDTO } from "@/dtos/imageDTO"

type ExtractResult = {
    payload: Record<string, any>
    files: Array<{
        fieldName: string
        file: ImageDTO
    }>
}

export function buildFormDataFromSchema(
    schema: FormSchema,
    values: Record<string, any>,
) {
    const formData = new FormData()
    const { payload, files } = extractPayloadAndFiles(schema, values)

    for (const [key, value] of Object.entries(payload)) {
        if (value === null || value === undefined) continue

        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value))
        } else {
            formData.append(key, String(value))
        }
    }

    for (const item of files) {
        formData.append(`${item.fieldName}[]`, {
            uri: item.file.uri,
            name: item.file.name,
            type: item.file.type,
        } as any)
    }
    //console.log("buildFormDataFromSchema => " + JSON.stringify(formData, null, 2));

    return formData
}

export function extractPayloadAndFiles(
    schema: FormSchema,
    values: Record<string, any>,
): ExtractResult {
    const payload: Record<string, any> = {}
    const files: Array<{ fieldName: string; file: ImageDTO }> = []

    for (const section of schema.sections) {
        for (const field of section.fields) {
            const value = values[field.name]

            if (field.type === "image") {
                if (!value) continue

                const images = Array.isArray(value) ? value : [value]

                for (const img of images) {
                    files.push({
                        fieldName: field.name,
                        file: img,
                    })
                }

                continue
            }

            if (field.type === "location") {
                if (value) {
                    payload.latitude = String(value.latitude)
                    payload.longitude = String(value.longitude)
                }
                continue
            }

            if (field.name === "process_number") {
                if (value) {
                    let data = value.split("/")

                    payload.process_number = data[0]?.trim()
                    payload.process_year = data[1]?.trim()
                }
                continue
            }

            payload[field.name] = value
        }
    }

    return { payload, files }
}