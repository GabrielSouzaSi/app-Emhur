export function maskPhone(value: string) {
    if (!value) return ""

    const numbers = value.replace(/\D/g, "").slice(0, 11)

    // até DDD
    if (numbers.length <= 2) {
        return numbers
    }

    // fixo (10 dígitos)
    if (numbers.length <= 10) {
        return numbers
            .replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2")
    }

    // celular (11 dígitos)
    return numbers
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
}