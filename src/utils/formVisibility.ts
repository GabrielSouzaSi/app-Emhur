import type { ApiField, VisibilityRule } from "@/dtos/formTypes"

function normalizeArray(value: unknown) {
	if (Array.isArray(value)) return value.map(String)
	return []
}

function compareRule(rule: VisibilityRule, currentValue: unknown) {
	const operator = rule.operator ?? "equals"

	switch (operator) {
		case "equals":
			return String(currentValue ?? "") === String(rule.value)

		case "not_equals":
			return String(currentValue ?? "") !== String(rule.value)

		case "includes": {
			const current = normalizeArray(currentValue)

			if (Array.isArray(rule.value)) {
				return rule.value.some((item) => current.includes(String(item)))
			}

			return current.includes(String(rule.value))
		}

		case "not_includes": {
			const current = normalizeArray(currentValue)

			if (Array.isArray(rule.value)) {
				return !rule.value.some((item) => current.includes(String(item)))
			}

			return !current.includes(String(rule.value))
		}

		default:
			return true
	}
}

export function isFieldVisible(field: ApiField, values: Record<string, any>) {
	if (!field.visibleWhen) return true

	const dependentValue = values[field.visibleWhen.field]
	return compareRule(field.visibleWhen, dependentValue)
}
