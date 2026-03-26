//src/utils/formValidation.ts
import type { ApiField, ImageField, LocationField, TextField } from "@/dtos/formTypes"
import { isValidCNPJ, isValidCPF, isValidCpfOrCnpj, onlyDigits } from "@/utils/cpfCnpj"
import { isValidProcess } from "./process"

function isEmptyString(value: unknown) {
    return typeof value === "string" && value.trim() === ""
}

function hasAnyValue(value: unknown) {
    return value !== null && value !== undefined && value !== "" && !isEmptyString(value)
}

function requiredMessage(field: ApiField) {
    return field.requiredMessage ?? "Campo obrigatório"
}

function validateTextLikeField(field: TextField, value: unknown) {
    if (!hasAnyValue(value)) return true

    const raw = String(value ?? "")
    const trimmed = raw.trim()

    if (field.minLength && trimmed.length < field.minLength) {
        return `Mínimo de ${field.minLength} caracteres`
    }

    if (field.maxLength && trimmed.length > field.maxLength) {
        return `Máximo de ${field.maxLength} caracteres`
    }

    if (field.pattern && !field.pattern.test(trimmed)) {
        return field.patternMessage ?? "Formato inválido"
    }

    if (field.type === "email" && trimmed.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(trimmed)) return "E-mail inválido"
    }

    if (field.type === "phone" && trimmed.length > 0) {
        const digits = onlyDigits(trimmed)
        if (digits.length < 10 || digits.length > 11) {
            return "Telefone inválido"
        }
    }

    if (field.type === "cpf" && trimmed.length > 0 && !isValidCPF(trimmed)) {
        return "CPF inválido"
    }

    if (field.type === "cnpj" && trimmed.length > 0 && !isValidCNPJ(trimmed)) {
        return "CNPJ inválido"
    }

    if (field.type === "cpf_cnpj" && trimmed.length > 0 && !isValidCpfOrCnpj(trimmed)) {
        return "CPF/CNPJ inválido"
    }

    if (field.type === "process" && trimmed.length > 0 && !isValidProcess(trimmed)) {
        return "Inválido. ex.: 1234/2026"
    }

    return true
}

function validateImageField(field: ImageField, value: unknown) {
    if (!field.required) return true

    if (!value) return "Imagem obrigatória"
    if (Array.isArray(value) && value.length === 0) return "Imagem obrigatória"

    return true
}

function validateLocationField(field: LocationField, value: unknown) {
    if (!field.required) return true
    if (!value) return "Localização obrigatória"

    const loc = value as { latitude?: number; longitude?: number } | null
    if (!loc?.latitude || !loc?.longitude) return "Localização obrigatória"

    return true
}

export function buildFieldRules(field: ApiField) {
    return {
        validate: (value: unknown) => {
            if (field.required) {
                if (field.type === "image") {
                    const imageResult = validateImageField(field, value)
                    if (imageResult !== true) return imageResult
                } else if (field.type === "location") {
                    const locationResult = validateLocationField(field, value)
                    if (locationResult !== true) return locationResult
                } else if (field.type === "select") {
                    if (field.multiple) {
                        if (!Array.isArray(value) || value.length === 0) {
                            return requiredMessage(field)
                        }
                    } else {
                        if (value === null || value === undefined || value === "") {
                            return requiredMessage(field)
                        }
                    }
                } else if (!hasAnyValue(value)) {
                    return requiredMessage(field)
                }
            }

            switch (field.type) {
                case "text":
                case "number":
                case "phone":
                case "textarea":
                case "email":
                case "password":
                case "cpf":
                case "cnpj":
                case "cpf_cnpj":
                case "process":
                    return validateTextLikeField(field, value)

                case "image":
                    return validateImageField(field, value)

                case "location":
                    return validateLocationField(field, value)

                default:
                    return true
            }
        },
    }
}