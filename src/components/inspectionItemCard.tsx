import { colors } from "@/styles/colors"
import { memo } from "react"
import { Switch, Text, TouchableOpacity, View } from "react-native"
import { Field } from "./input"

export const InspectionItemCard = memo(
	({ item, isOpen, onToggleExists, onOpenDropdown, onSelectStatus, onChangeInfo }: any) => {
		return (
			<View
				className="w-full p-4 mb-4 bg-white rounded-md border border-gray-300 gap-4"
				style={{
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 3 },
					shadowOpacity: 0.27,
					shadowRadius: 4.65,
					elevation: 6,
				}}
			>
				{/* Título + Switch */}
				<View className="flex-row justify-between items-start mb-3">
					<View className="flex-1 mr-3">
						<Text className="font-semiBold text-lg" numberOfLines={3}>
							{item.item}
						</Text>
					</View>

					<View className="items-center">
						<Text className="font-semiBold text-md mb-1">Existe?</Text>
						<Switch
							trackColor={{ false: "#767577", true: "#81b0ff" }}
							thumbColor={item.exists ? colors.blue[700] : "#f4f3f4"}
							value={item.exists}
							onValueChange={() => onToggleExists(item.id)}
						/>
					</View>
				</View>

				{/* Dropdown */}
				<TouchableOpacity
					className="flex-row justify-between items-center h-16 border-gray-400 border-2 bg-white rounded-md px-4"
					onPress={() => onOpenDropdown(item.id)}
				>
					<Text className="font-semiBold text-lg">
						{item.status || "Selecione o status"}
					</Text>
				</TouchableOpacity>

				{isOpen && (
					<View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
						<TouchableOpacity
							className="bg-blue-500 rounded-md p-2 my-2"
							onPress={() => onSelectStatus(item.id, "apto")}
						>
							<Text className="text-lg font-semiBold text-white">Apto</Text>
						</TouchableOpacity>

						<TouchableOpacity
							className="bg-blue-500 rounded-md p-2 my-2"
							onPress={() => onSelectStatus(item.id, "inapto")}
						>
							<Text className="text-lg font-semiBold text-white">Inapto</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Informações adicionais */}
				<Field
					className="mb-4"
					placeholder="Informações adicionais"
					variant="primary"
					value={item.additional_info}
					onChangeText={(text) => onChangeInfo(item.id, text)}
				/>
			</View>
		)
	}
)
