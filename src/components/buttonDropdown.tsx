// src/components/buttonDropdown.tsx
import { Ionicons } from "@expo/vector-icons"
import clsx from "clsx"
import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"

type Item = {
	label: string
	value: string
}

export type DropdownButtonRef = {
	focus: () => void
	blur: () => void
}

type DropdownButtonProps = {
	data: Item[]
	onSelect: (data: Item) => void
	placeholder?: string
	errorMessage?: string
	value?: string | number | null
}

const DropdownButton = forwardRef<DropdownButtonRef, DropdownButtonProps>(
	({ data, onSelect, placeholder = "Selecione uma opção", errorMessage, value }, ref) => {
		const [selectedValue, setSelectedLabel] = useState<string | null>(null)
		const [isDropdownVisible, setIsDropdownVisible] = useState(false)

		useEffect(() => {
			if (value != null) {
				const selectedItem = data.find((item) => item.value === value)
				setSelectedLabel(selectedItem ? selectedItem.label : null)
			}
		}, [value, data])

		useImperativeHandle(ref, () => ({
			focus: () => setIsDropdownVisible(true),
			blur: () => setIsDropdownVisible(false),
		}))

		const handleSelect = (item: Item) => {
			setSelectedLabel(item.label)
			onSelect(item)
			setIsDropdownVisible(false)
		}

		return (
			<View>
				<TouchableOpacity
					className={clsx(
						"flex-row justify-between items-center h-16 border-gray-400 border-2 bg-white rounded-md px-4",
						{ "border-gray-400": !errorMessage },
						{ "border-red-400": errorMessage },
					)}
					onPress={() => setIsDropdownVisible((prev) => !prev)}
				>
					<Text className="font-semiBold text-lg">
						{selectedValue ? selectedValue : placeholder}
					</Text>

					<Ionicons
						name={isDropdownVisible ? "chevron-up" : "chevron-down"}
						size={20}
						color="black"
					/>
				</TouchableOpacity>

				{errorMessage && <Text className="text-red-500 mt-1 ml-1">{errorMessage}</Text>}

				{isDropdownVisible && (
					<View className="mt-4 bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
						<FlatList
							data={data}
							keyExtractor={(item) => item.value}
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
				)}
			</View>
		)
	},
)

DropdownButton.displayName = "DropdownButton"

export { DropdownButton }
