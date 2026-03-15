// utils/process.ts
export function maskProcess(value: string) {
    let cleaned = (value ?? "").replace(/[^\d/]/g, "")

    const parts = cleaned.split("/")

    // só permite uma barra
    if (parts.length > 2) {
        cleaned = `${parts[0]}/${parts[1]}`
    }

    return cleaned
}

export function isValidProcess(value: string) {
    return /^\d+\/\d{4}$/.test((value ?? "").trim())
}