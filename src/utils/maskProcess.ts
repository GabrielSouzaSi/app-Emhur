// utils/maskProcess.ts
export function onlyProcessDigits(value: string) {
    return (value ?? "").replace(/\D/g, "")
}

export function maskProcess(value: string) {
    const digits = onlyProcessDigits(value)

    if (!digits) return ""

    if (digits.length <= 4) {
        return digits
    }

    const numberPart = digits.slice(0, -4)
    const yearPart = digits.slice(-4)

    return `${numberPart}/${yearPart}`
}