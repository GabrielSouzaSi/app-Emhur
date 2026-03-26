// src/components/buttonDropdown.tsx
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"

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
	onSelect: (data: Item) => void
	placeholder?: string
	errorMessage?: string
	value?: string | number | null
	disabled?: boolean
}

const DropdownButton = forwardRef<DropdownButtonRef, DropdownButtonProps>(
	(
		{ data, onSelect, placeholder = "Selecione uma opção", errorMessage, value, disabled },
		ref,
	) => {
		const [isDropdownVisible, setIsDropdownVisible] = useState(false)

		const selectedLabel = useMemo(() => {
			if (value == null) return null
			const found = data.find((item) => String(item.value) === String(value))
			return found?.label ?? null
		}, [value, data])

		useEffect(() => {
			if (disabled) {
				setIsDropdownVisible(false)
			}
		}, [disabled])

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

		const handleSelect = (item: Item) => {
			onSelect(item)
			setIsDropdownVisible(false)
		}

		return (
			<View>
				<TouchableOpacity
					disabled={disabled}
					className={clsx(
						"flex-row justify-between items-center h-16 border-2 bg-white rounded-md px-4",
						{ "border-gray-400": !errorMessage },
						{ "border-red-400": !!errorMessage },
						{ "opacity-60": disabled },
					)}
					onPress={() => setIsDropdownVisible((prev) => !prev)}
				>
					<Text className="font-semiBold text-lg text-gray-700">
						{selectedLabel ?? placeholder}
					</Text>

					<Ionicons
						name={isDropdownVisible ? "chevron-up" : "chevron-down"}
						size={20}
						color="black"
					/>
				</TouchableOpacity>

				{errorMessage ? (
					<Text className="text-red-500 mt-1 ml-1">{errorMessage}</Text>
				) : null}

				{isDropdownVisible ? (
					<View className="mt-4 bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
						<FlatList
							data={data}
							keyExtractor={(item) => String(item.value)}
							renderItem={({ item }) => (
								<TouchableOpacity
									className="bg-blue-500 rounded-md p-2 my-2"
									onPress={() => handleSelect(item)}
								>
									<Text className="text-lg font-semiBold text-white">
										{item.label}
									</Text>
								</TouchableOpacity>
							)}
							horizontal={false}
							scrollEnabled={false}
							showsVerticalScrollIndicator={false}
						/>
					</View>
				) : null}
			</View>
		)
	},
)

DropdownButton.displayName = "DropdownButton"

export { DropdownButton }
