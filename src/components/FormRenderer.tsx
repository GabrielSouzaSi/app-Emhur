// src/components/FormRenderer.tsx

import { Button } from "@/components/button"
import type { ApiField, FormSchema, FormSection } from "@/dtos/formTypes"
import { isValidCNPJ, isValidCPF, isValidCpfOrCnpj } from "@/utils/cpfCnpj"
import { isValidProcess } from "@/utils/process"
import { useCallback, useMemo, useRef, useState } from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { FieldRenderer } from "./FieldRenderer"
import { HeaderBack } from "./headerBack"

type Props = {
	schema: FormSchema
	initialValues?: Record<string, any>
	onSubmit: (values: Record<string, any>) => Promise<void> | void
}

function isFocusableField(field: ApiField) {
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
		field.type === "select" ||
		field.type === "phone"
	)
}

function buildInitialValues(fields: ApiField[], initial?: Record<string, any>) {
	const base: Record<string, any> = {}
	for (const f of fields) {
		if (initial && f.name in initial) {
			base[f.name] = initial[f.name]
			continue
		}
		if (f.type === "image") base[f.name] = f.multiple ? [] : null
		else if (f.type === "select") base[f.name] = null
		else base[f.name] = ""
	}
	return base
}

function buildSectionRows(section: FormSection) {
	const fieldMap = new Map(section.fields.map((field) => [field.name, field]))
	const rows: ApiField[][] = []

	if (section.layout && section.layout.length > 0) {
		for (const row of section.layout) {
			const rowFields = row
				.map((fieldName) => fieldMap.get(fieldName))
				.filter(Boolean) as ApiField[]

			if (rowFields.length > 0) rows.push(rowFields)
		}
	}

	const usedNames = new Set(rows.flat().map((f) => f.name))
	const remaining = section.fields.filter((f) => !usedNames.has(f.name))

	for (const field of remaining) {
		rows.push([field])
	}

	return rows
}

export function FormRenderer({ schema, initialValues, onSubmit }: Props) {
	const allFields = useMemo(() => schema.sections.flatMap((s) => s.fields), [schema])

	const initial = useMemo(
		() => buildInitialValues(allFields, initialValues),
		[allFields, initialValues],
	)

	const [values, setValues] = useState<Record<string, any>>(initial)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [submitting, setSubmitting] = useState(false)
	const fieldRefs = useRef<Record<string, any>>({})

	const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
		const m: Record<string, boolean> = {}
		for (const s of schema.sections) {
			m[s.id] = !!s.initiallyCollapsed
		}
		return m
	})

	const orderedFocusableFields = useMemo(() => {
		const result: ApiField[] = []

		for (const section of schema.sections) {
			if (collapsed[section.id]) continue

			const rows = buildSectionRows(section)
			for (const row of rows) {
				for (const field of row) {
					if (isFocusableField(field)) {
						result.push(field)
					}
				}
			}
		}

		return result
	}, [schema.sections, collapsed])

	const focusFirstError = useCallback(
		(nextErrors: Record<string, string>) => {
			const firstFieldWithError = orderedFocusableFields.find(
				(field) => !!nextErrors[field.name],
			)

			if (!firstFieldWithError) return

			const ref = fieldRefs.current[firstFieldWithError.name]
			ref?.focus?.()
		},
		[orderedFocusableFields],
	)

	const focusNextField = useCallback(
		(currentFieldName: string) => {
			const currentIndex = orderedFocusableFields.findIndex(
				(field) => field.name === currentFieldName,
			)

			if (currentIndex === -1) return

			const nextField = orderedFocusableFields[currentIndex + 1]
			if (!nextField) return

			requestAnimationFrame(() => {
				fieldRefs.current[nextField.name]?.focus?.()
			})
		},
		[orderedFocusableFields],
	)

	const setValue = useCallback((name: string, value: any) => {
		setValues((prev) => ({ ...prev, [name]: value }))

		setErrors((prev) => {
			if (!prev[name]) return prev
			return { ...prev, [name]: "" }
		})
	}, [])

	function validate() {
		const next: Record<string, string> = {}

		for (const f of allFields) {
			const v = values[f.name]
			const hasValue =
				v !== null &&
				v !== undefined &&
				v !== "" &&
				!(typeof v === "string" && v.trim() === "")

			if (f.required) {
				let empty = false

				if (f.type === "image") empty = !v || (Array.isArray(v) && v.length === 0)
				else if (f.type === "select") empty = v === null || v === undefined || v === ""
				else empty = !hasValue

				if (empty) {
					next[f.name] = f.type === "image" ? "Imagem obrigatória" : "Campo obrigatório"
					continue
				}
			}

			switch (f.type) {
				case "cpf":
					if (hasValue && !isValidCPF(String(v))) next[f.name] = "CPF inválido"
					break

				case "cnpj":
					if (hasValue && !isValidCNPJ(String(v))) next[f.name] = "CNPJ inválido"
					break

				case "cpf_cnpj":
					if (hasValue && !isValidCpfOrCnpj(String(v))) next[f.name] = "CPF/CNPJ inválido"
					break

				case "process":
					if (hasValue && !isValidProcess(String(v))) {
						next[f.name] = "Inválido. ex.: 123/2026"
					}
					break

				case "text":
				case "textarea":
				case "email":
				case "password": {
					if (typeof v === "string") {
						const t = v.trim()
						if (f.minLength && t.length < f.minLength) {
							next[f.name] = `Mínimo de ${f.minLength} caracteres`
						}
						if (f.maxLength && v.length > f.maxLength) {
							next[f.name] = `Máximo de ${f.maxLength} caracteres`
						}
						if (f.pattern && !f.pattern.test(t)) {
							next[f.name] = f.patternMessage ?? "Formato inválido"
						}
					}
					break
				}

				case "location":
					if (f.required && !v) next[f.name] = "Localização obrigatória"
					break

				default:
					break
			}
		}

		setErrors(next)

		const hasErrors = Object.keys(next).length > 0

		if (hasErrors) {
			focusFirstError(next)
			return false
		}

		return true
	}

	async function handleSubmit() {
		if (!validate()) {
			Alert.alert("Atenção", "Corrija os campos em vermelho.")
			return
		}

		try {
			setSubmitting(true)
			await onSubmit(values)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<View className="flex-1">
			<HeaderBack title={schema.title ?? "Teste"} variant="primary" />

			{schema.sections.map((section) => {
				const isCollapsed = collapsed[section.id]
				const canCollapse = !!section.collapsible

				return (
					<View
						key={section.id}
						className="my-3 bg-white mx-4 rounded-2xl p-4 border-2 border-gray-300"
					>
						<TouchableOpacity
							activeOpacity={canCollapse ? 0.7 : 1}
							onPress={() => {
								if (!canCollapse) return
								setCollapsed((p) => ({ ...p, [section.id]: !p[section.id] }))
							}}
							className="flex-row items-center justify-between mb-2"
						>
							<Text className="text-lg font-bold text-gray-800">{section.title}</Text>
							{canCollapse ? (
								<Text className="text-gray-500">
									{isCollapsed ? "Abrir" : "Fechar"}
								</Text>
							) : null}
						</TouchableOpacity>

						{section.description ? (
							<Text className="text-gray-500 mb-3">{section.description}</Text>
						) : null}

						{!isCollapsed
							? buildSectionRows(section).map((row, rowIndex) => (
									<View
										key={`${section.id}-row-${rowIndex}`}
										className="flex-row gap-2"
									>
										{row.map((f) => (
											<View key={f.name} className="flex-1">
												<FieldRenderer
													field={f}
													value={values[f.name]}
													error={errors[f.name]}
													onChange={setValue}
													inputRef={(ref) => {
														fieldRefs.current[f.name] = ref
													}}
													onSubmitEditing={() => focusNextField(f.name)}
													returnKeyType={
														orderedFocusableFields[
															orderedFocusableFields.length - 1
														]?.name === f.name
															? "done"
															: "next"
													}
													isLastField={
														orderedFocusableFields[
															orderedFocusableFields.length - 1
														]?.name === f.name
													}
												/>
											</View>
										))}
									</View>
								))
							: null}
					</View>
				)
			})}

			<View className="px-4">
				<Button onPress={handleSubmit} disabled={submitting}>
					<Button.TextButton title={submitting ? "Enviando..." : "Enviar"} />
				</Button>
			</View>
		</View>
	)
}
