export function maskDocument(value: unknown, visibleCharacters = 3) {
	if (typeof value !== "string" || value.trim() === "") {
		return "Não informado"
	}

	return `${value.trim().slice(0, visibleCharacters)}*****`
}
