// utils/maskProcess.ts
export function maskProcess(text: string) {
    const digits = (text ?? "").replace(/\D/g, "")

    if (digits.length <= 4) {
        return digits
    }

    const numberPart = digits.slice(0, -4)
    const yearPart = digits.slice(-4)

    return `${numberPart}/${yearPart}`
}