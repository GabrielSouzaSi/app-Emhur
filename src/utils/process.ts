// utils/process.ts
const currentdate = new Date()
const date = currentdate.getFullYear() + 1

export function isValidProcess(value: string) {
    const raw = String(value ?? "").trim()

    // formato: qualquer quantidade de dígitos + / + 4 dígitos
    const regex = /^\d+\/\d{4}$/

    if (!regex.test(raw)) return false

    const [numberPart, yearPart] = raw.split("/")

    if (!numberPart) return false
    if (!yearPart || yearPart.length !== 4) return false

    const year = Number(yearPart)
    if (Number.isNaN(year)) return false
    if (year < currentdate.getFullYear() - 6 || year > date) return false

    return true
}