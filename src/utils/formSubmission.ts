// src/utils/formSubmission.ts
import type { FormSchema } from "@/dtos/formTypes"
import type { ImageDTO } from "@/dtos/imageDTO"
import { onlyDigits } from "@/utils/cpfCnpj"

type ExtractResult = {
	payload: Record<string, any>
	files: Array<{
		fieldName: string
		file: ImageDTO
	}>
}

// normalização dos campos
function normalizePrimitiveField(type: string, value: any) {
	if (value === null || value === undefined) return value

	switch (type) {
		case "phone":
		case "cpf":
		case "cnpj":
		case "cpf_cnpj":
			return onlyDigits(String(value))

		case "text":
		case "textarea":
		case "email":
		case "password":
			return typeof value === "string" ? value.trim() : value

		default:
			return value
	}
}

// Construção dos dados para envio
export function buildFormDataFromSchema(schema: FormSchema, values: Record<string, any>) {
	const formData = new FormData()
	const { payload, files } = extractPayloadAndFiles(schema, values)

	for (const [key, value] of Object.entries(payload)) {
		if (value === null || value === undefined || value === "") continue

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

	return formData
}

// Trata os campos específicos antes de enviar
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
					if (!img?.uri) continue

					files.push({
						fieldName: field.name,
						file: img,
					})
				}

				continue
			}

			if (field.type === "location") {
				if (value?.latitude != null) payload.latitude = String(value.latitude)
				if (value?.longitude != null) payload.longitude = String(value.longitude)
				continue
			}

			if (field.name === "process_number") {
				const raw = String(value ?? "").trim()

				if (raw && raw.includes("/")) {
					const [processNumber, processYear] = raw.split("/")

					payload.process_number = processNumber?.trim()
					payload.process_year = processYear?.trim()
				}

				continue
			}

			if (field.name === "service_order_number") {
				const raw = String(value ?? "").trim()

				if (raw && raw.includes("/")) {
					const [serciceOrderNumber, serviceOrderYear] = raw.split("/")

					payload.service_order_number = serciceOrderNumber?.trim()
					payload.service_order_year = serviceOrderYear?.trim()
				}

				continue
			}

			payload[field.name] = normalizePrimitiveField(field.type, value)
		}
	}

	//console.log("Payload \n" + JSON.stringify(payload, null, 2))

	return { payload, files }
}
