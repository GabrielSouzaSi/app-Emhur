// src/components/FormRenderer.tsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Alert, Text, TouchableOpacity, View } from "react-native"

import { Button } from "@/components/button"
import type { ApiField, FormSchema } from "@/dtos/formTypes"
import {
	buildDefaultValuesFromSchema,
	buildVisibleSectionRows,
	isFocusableField,
} from "@/utils/formSchema"
import { isFieldVisible } from "@/utils/formVisibility"
import { FieldRenderer } from "./FieldRenderer"
import { HeaderBack } from "./headerBack"

type Props = {
	schema: FormSchema
	initialValues?: Record<string, any>
	onSubmit: (values: Record<string, any>) => Promise<void> | void
}

export function FormRenderer({ schema, initialValues, onSubmit }: Props) {
	const defaultValues = useMemo(
		() => buildDefaultValuesFromSchema(schema, initialValues),
		[schema, initialValues],
	)

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
		setFocus,
		getValues,
		setValue,
		clearErrors,
	} = useForm<Record<string, any>>({
		defaultValues,
		mode: "onSubmit",
		reValidateMode: "onChange",
	})

	const watchedValues = useWatch({ control })
	const formValues = watchedValues ?? {}

	useEffect(() => {
		for (const section of schema.sections) {
			for (const field of section.fields) {
				const visible = isFieldVisible(field, formValues)

				if (!visible) {
					let emptyValue: any = ""

					if (field.type === "image") emptyValue = field.multiple ? [] : null
					else if (field.type === "select") emptyValue = field.multiple ? [] : null
					else if (field.type === "location") emptyValue = null
					else emptyValue = ""

					const currentValue = getValues(field.name)

					if (JSON.stringify(currentValue) !== JSON.stringify(emptyValue)) {
						setValue(field.name, emptyValue, {
							shouldValidate: false,
							shouldDirty: false,
							shouldTouch: false,
						})
						clearErrors(field.name)
					}
				}
			}
		}
	}, [formValues, schema.sections, getValues, setValue, clearErrors])
	const fieldRefs = useRef<Record<string, any>>({})

	const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
		const map: Record<string, boolean> = {}
		for (const section of schema.sections) {
			map[section.id] = !!section.initiallyCollapsed
		}
		return map
	})

	useEffect(() => {
		reset(defaultValues)
	}, [defaultValues, reset])

	const orderedFocusableFields = useMemo(() => {
		const result: ApiField[] = []

		for (const section of schema.sections) {
			if (collapsed[section.id]) continue

			const rows = buildVisibleSectionRows(section, formValues)
			for (const row of rows) {
				for (const field of row) {
					if (isFocusableField(field)) {
						result.push(field)
					}
				}
			}
		}

		return result
	}, [schema.sections, collapsed, formValues])

	const focusField = useCallback(
		(fieldName: string) => {
			const ref = fieldRefs.current[fieldName]

			if (ref?.focus) {
				ref.focus()
				return
			}

			setFocus(fieldName as any)
		},
		[setFocus],
	)

	const focusFirstError = useCallback(() => {
		const errorNames = Object.keys(errors)
		if (!errorNames.length) return

		const firstFocusableError = orderedFocusableFields.find((field) =>
			errorNames.includes(field.name),
		)

		if (firstFocusableError) {
			requestAnimationFrame(() => {
				focusField(firstFocusableError.name)
			})
		}
	}, [errors, orderedFocusableFields, focusField])

	useEffect(() => {
		if (Object.keys(errors).length > 0) {
			focusFirstError()
		}
	}, [errors, focusFirstError])

	const focusNextField = useCallback(
		(currentFieldName: string) => {
			const currentIndex = orderedFocusableFields.findIndex(
				(field) => field.name === currentFieldName,
			)

			if (currentIndex === -1) return

			const nextField = orderedFocusableFields[currentIndex + 1]
			if (!nextField) return

			requestAnimationFrame(() => {
				focusField(nextField.name)
			})
		},
		[orderedFocusableFields, focusField],
	)

	const onValidSubmit = useCallback(
		async (values: Record<string, any>) => {
			await onSubmit(values)
		},
		[onSubmit],
	)

	const onInvalidSubmit = useCallback(() => {
		Alert.alert("Atenção", "Corrija os campos em vermelho.")
	}, [])

	return (
		<View className="flex-1">
			<HeaderBack
				title={schema.title ?? "Formulário"}
				version={schema.schemaVersion ?? ""}
				variant="primary"
			/>

			{schema.sections.map((section) => {
				const isCollapsed = collapsed[section.id]
				const canCollapse = !!section.collapsible
				const rows = buildVisibleSectionRows(section, formValues)

				return (
					<View
						key={section.id}
						className="my-3 bg-white mx-4 rounded-2xl p-4 border-2 border-gray-300"
					>
						<TouchableOpacity
							activeOpacity={canCollapse ? 0.7 : 1}
							onPress={() => {
								if (!canCollapse) return
								setCollapsed((prev) => ({
									...prev,
									[section.id]: !prev[section.id],
								}))
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
							? rows.map((row, rowIndex) => (
									<View
										key={`${section.id}-row-${rowIndex}`}
										className="flex-row gap-2"
									>
										{row.map((field) => {
											const isLast =
												orderedFocusableFields[
													orderedFocusableFields.length - 1
												]?.name === field.name

											return (
												<View key={field.name} className="flex-1">
													<FieldRenderer
														field={field}
														control={control}
														inputRef={(ref) => {
															fieldRefs.current[field.name] = ref
														}}
														onSubmitEditing={() =>
															focusNextField(field.name)
														}
														returnKeyType={isLast ? "done" : "next"}
														isLastField={isLast}
													/>
												</View>
											)
										})}
									</View>
								))
							: null}
					</View>
				)
			})}

			<View className="px-4">
				<Button
					onPress={handleSubmit(onValidSubmit, onInvalidSubmit)}
					disabled={isSubmitting}
				>
					<Button.TextButton title={isSubmitting ? "Enviando..." : "Enviar"} />
				</Button>
			</View>
		</View>
	)
}
