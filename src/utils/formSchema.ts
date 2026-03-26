//src/utils/formSchema.ts
import type { ApiField, FormSchema, FormSection } from "@/dtos/formTypes"

export function buildSectionRows(section: FormSection) {
    const fieldMap = new Map(section.fields.map((field) => [field.name, field]))
    const rows: ApiField[][] = []

    if (section.layout?.length) {
        for (const row of section.layout) {
            const rowFields = row
                .map((fieldName) => fieldMap.get(fieldName))
                .filter(Boolean) as ApiField[]

            if (rowFields.length > 0) {
                rows.push(rowFields)
            }
        }
    }

    const usedNames = new Set(rows.flat().map((f) => f.name))
    const remaining = section.fields.filter((f) => !usedNames.has(f.name))

    for (const field of remaining) {
        rows.push([field])
    }

    return rows
}

export function isFocusableField(field: ApiField) {
    return (
        field.type === "text" ||
        field.type === "number" ||
        field.type === "textarea" ||
        field.type === "email" ||
        field.type === "password" ||
        field.type === "cpf" ||
        field.type === "cnpj" ||
        field.type === "cpf_cnpj" ||
        field.type === "process" ||
        field.type === "phone" ||
        field.type === "select"
    )
}

export function buildDefaultValuesFromSchema(
    schema: FormSchema,
    initialValues?: Record<string, any>,
) {
    const allFields = schema.sections.flatMap((section) => section.fields)
    const defaults: Record<string, any> = {}

    for (const field of allFields) {
        if (initialValues && field.name in initialValues) {
            defaults[field.name] = initialValues[field.name]
            continue
        }

        switch (field.type) {
            case "image":
                defaults[field.name] = field.multiple ? [] : null
                break
            case "select":
                defaults[field.name] = field.multiple ? [] : null
                break
            case "location":
                defaults[field.name] = null
                break
            default:
                defaults[field.name] = ""
                break
        }
    }

    return defaults
}