// utils/cpfCnpj.ts
export function onlyDigits(v: string) {
    return (v ?? "").replace(/\D/g, "")
}

export function maskCPF(value: string) {
    const d = onlyDigits(value).slice(0, 11)
    // 000.000.000-00
    return d
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
}

export function maskCNPJ(value: string) {
    const d = onlyDigits(value).slice(0, 14)
    // 00.000.000/0000-00
    return d
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5")
}

export function maskCpfCnpj(value: string) {
    const d = onlyDigits(value)
    return d.length <= 11 ? maskCPF(d) : maskCNPJ(d)
}

// -------- validação CPF
export function isValidCPF(value: string) {
    const cpf = onlyDigits(value)
    if (cpf.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cpf)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
    let d1 = 11 - (sum % 11)
    if (d1 >= 10) d1 = 0
    if (d1 !== Number(cpf[9])) return false

    sum = 0
    for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
    let d2 = 11 - (sum % 11)
    if (d2 >= 10) d2 = 0
    return d2 === Number(cpf[10])
}

// -------- validação CNPJ
export function isValidCNPJ(value: string) {
    const cnpj = onlyDigits(value)
    if (cnpj.length !== 14) return false
    if (/^(\d)\1{13}$/.test(cnpj)) return false

    const calcDigit = (base: string, weights: number[]) => {
        let sum = 0
        for (let i = 0; i < weights.length; i++) sum += Number(base[i]) * weights[i]
        const mod = sum % 11
        return mod < 2 ? 0 : 11 - mod
    }

    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    const d1 = calcDigit(cnpj, w1)
    const d2 = calcDigit(cnpj.slice(0, 12) + String(d1), w2)

    return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13])
}

export function isValidCpfOrCnpj(value: string) {
    const d = onlyDigits(value)
    if (d.length <= 11) return isValidCPF(d)
    return isValidCNPJ(d)
}