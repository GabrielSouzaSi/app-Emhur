// src/components/buttonDropdown.tsx
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { forwardRef, useImperativeHandle, useMemo, useState } from "react"
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"

type Item = {
	label: string
	value: string
}

export type DropdownButtonRef = {
	focus: () => void
	blur: () => void
	open: () => void
	close: () => void
}

type DropdownButtonProps = {
	data: Item[]
	onSelect: (value: string | string[]) => void
	placeholder?: string
	errorMessage?: string
	value?: string | string[] | number | null
	disabled?: boolean
	searchable?: boolean
	multiple?: boolean
	searchPlaceholder?: string
}

const DropdownButton = forwardRef<DropdownButtonRef, DropdownButtonProps>(
	(
		{
			data,
			onSelect,
			placeholder = "Selecione uma opção",
			errorMessage,
			value,
			disabled,
			searchable = false,
			multiple = false,
			searchPlaceholder = "Buscar...",
		},
		ref,
	) => {
		const [isDropdownVisible, setIsDropdownVisible] = useState(false)
		const [search, setSearch] = useState("")

		const selectedValues = useMemo(() => {
			if (multiple) {
				return Array.isArray(value) ? value.map(String) : []
			}
			return value != null ? [String(value)] : []
		}, [value, multiple])

		const filteredData = useMemo(() => {
			const term = search.trim().toLowerCase()
			if (!term) return data

			return data.filter((item) => item.label.toLowerCase().includes(term))
		}, [data, search])

		const selectedLabels = useMemo(() => {
			const map = new Map(data.map((item) => [String(item.value), item.label]))
			return selectedValues.map((v) => map.get(String(v))).filter(Boolean) as string[]
		}, [data, selectedValues])

		const displayText = useMemo(() => {
			if (!selectedLabels.length) return placeholder
			if (!multiple) return selectedLabels[0]
			return selectedLabels.join(", ")
		}, [selectedLabels, placeholder, multiple])

		useImperativeHandle(ref, () => ({
			focus: () => {
				if (!disabled) setIsDropdownVisible(true)
			},
			blur: () => setIsDropdownVisible(false),
			open: () => {
				if (!disabled) setIsDropdownVisible(true)
			},
			close: () => setIsDropdownVisible(false),
		}))

		function handleSingleSelect(item: Item) {
			onSelect(item.value)
			setIsDropdownVisible(false)
		}

		function handleMultiSelect(item: Item) {
			const exists = selectedValues.includes(String(item.value))

			const next = exists
				? selectedValues.filter((v) => v !== String(item.value))
				: [...selectedValues, String(item.value)]

			onSelect(next)
		}

		return (
			<View>
				<TouchableOpacity
					disabled={disabled}
					className={clsx(
						"min-h-16 border-2 bg-white rounded-md px-4 py-3",
						{ "border-gray-400": !errorMessage },
						{ "border-red-400": !!errorMessage },
						{ "opacity-60": disabled },
					)}
					onPress={() => setIsDropdownVisible((prev) => !prev)}
				>
					<View className="flex-row items-center justify-between">
						<Text className="font-semiBold text-lg text-gray-700 flex-1">
							{displayText}
						</Text>

						<Ionicons
							name={isDropdownVisible ? "chevron-up" : "chevron-down"}
							size={20}
							color="black"
						/>
					</View>
				</TouchableOpacity>

				{errorMessage ? (
					<Text className="text-red-500 mt-1 ml-1">{errorMessage}</Text>
				) : null}

				{isDropdownVisible ? (
					<View className="mt-4 bg-white rounded-md p-3 border-2 border-gray-300 mb-4">
						{searchable ? (
							<TextInput
								value={search}
								onChangeText={setSearch}
								placeholder={searchPlaceholder}
								placeholderTextColor="#6B7280"
								className="h-12 border border-gray-300 rounded-md px-3 mb-3 text-base text-gray-700"
							/>
						) : null}

						{filteredData.length === 0 ? (
							<Text className="text-gray-500 text-center py-4">
								Nenhum resultado encontrado
							</Text>
						) : (
							<ScrollView
								showsVerticalScrollIndicator={false}
								nestedScrollEnabled={true}
								keyboardShouldPersistTaps="handled"
								style={{ maxHeight: 260 }}
							>
								{filteredData.map((item) => {
									const selected = selectedValues.includes(String(item.value))

									return (
										<Pressable
											key={String(item.value)}
											className={clsx(
												"rounded-md p-3 my-1 border",
												selected
													? "bg-blue-500 border-blue-500"
													: "bg-white border-gray-300",
											)}
											onPress={() =>
												multiple
													? handleMultiSelect(item)
													: handleSingleSelect(item)
											}
										>
											<View className="flex-row items-center justify-between">
												<Text
													className={clsx(
														"text-base font-semiBold",
														selected ? "text-white" : "text-gray-800",
													)}
												>
													{item.label}
												</Text>

												{selected ? (
													<Ionicons
														name="checkmark"
														size={18}
														color="white"
													/>
												) : null}
											</View>
										</Pressable>
									)
								})}
							</ScrollView>
						)}

						{multiple ? (
							<View className="mt-3 flex-row justify-end">
								<TouchableOpacity
									className="bg-gray-200 px-4 py-2 rounded-md"
									onPress={() => setIsDropdownVisible(false)}
								>
									<Text className="font-semiBold text-gray-800">Concluir</Text>
								</TouchableOpacity>
							</View>
						) : null}
					</View>
				) : null}
			</View>
		)
	},
)

DropdownButton.displayName = "DropdownButton"

export { DropdownButton }
