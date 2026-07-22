import { router } from "expo-router"
import React from "react"
import { FlatList, Pressable, Text, View } from "react-native"

type DataForm = {
	id: number
	type_form_id: number
	title: string
	schemaVersion: string
	schemaId: string
	updatedAt: string
	errorMessage: string
	data: any
}

type DataCardProps = {
	data: DataForm[]
	onDelete: (id: number) => void
	onSend: (id: number) => void
	onView: (id: number) => void
}

function formatDate(dateString: string) {
	const date = new Date(dateString)

	const day = String(date.getDate()).padStart(2, "0")
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const year = date.getFullYear()

	const hours = String(date.getHours()).padStart(2, "0")
	const minutes = String(date.getMinutes()).padStart(2, "0")
	const seconds = String(date.getSeconds()).padStart(2, "0")

	return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`
}

const FundiaryCardOffline: React.FC<DataCardProps> = ({ data, onDelete, onSend, onView }) => {
	return (
		<FlatList
			data={data}
			keyExtractor={(item) => String(item.id)}
			contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
			renderItem={({ item }) => (
				<View className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
					<View className="p-4">
						<View className="mb-3 flex-row items-start justify-between">
							<View className="flex-1 pr-3">
								<Text className="text-lg font-bold text-gray-900">
									{item.title ?? item.schemaId}
									{` - ${item.schemaVersion ?? ""}`}
								</Text>
								<Text className="mt-1 text-sm text-gray-500">
									{formatDate(item.updatedAt)}
								</Text>
							</View>

							<View className="rounded-full bg-blue-50 px-3 py-1">
								<Text className="text-xs font-semibold text-blue-600">Offline</Text>
							</View>
						</View>

						<View className="gap-2">
							<View className="rounded-xl bg-gray-50 px-3 py-2">
								<Text className="text-xs font-medium uppercase text-gray-400">
									Solicitante
								</Text>
								<Text className="text-base font-semibold text-gray-800">
									{item.data?.requester_name || "Não informado"}
								</Text>
							</View>

							<View className="flex-row gap-2">
								<View className="flex-1 rounded-xl bg-gray-50 px-3 py-2">
									<Text className="text-xs font-medium uppercase text-gray-400">
										Ordem de Serviço
									</Text>
									<Text className="text-sm font-semibold text-gray-800">
										{item.data?.service_order_number || "Não informado"}
									</Text>
								</View>

								<View className="flex-1 rounded-xl bg-gray-50 px-3 py-2">
									<Text className="text-xs font-medium uppercase text-gray-400">
										Processo
									</Text>
									<Text className="text-sm font-semibold text-gray-800">
										{item.data?.process_number || "Não informado"}
									</Text>
								</View>
							</View>
						</View>

						{item.errorMessage ? (
							<View className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
								<Text className="text-sm font-medium text-red-600">
									{item.errorMessage}
								</Text>
							</View>
						) : null}
					</View>

					<View className="flex-row border-t border-gray-200 bg-gray-50">
						<Pressable
							className="flex-1 items-center justify-center py-3 active:opacity-70"
							onPress={() => {
								router.push({
									pathname: "/(auth)/fundiariaFormold",
									params: { entryId: item.id, typeFormId: item.type_form_id },
								})
							}}
						>
							<Text className="text-base font-bold text-blue-600">Abrir</Text>
						</Pressable>

						<View className="w-px bg-gray-200" />

						<Pressable
							onPress={() => onView(item.id)}
							className="flex-1 items-center justify-center py-3 active:opacity-70"
						>
							<Text className="text-base font-bold text-purple-600">PDF</Text>
						</Pressable>

						<View className="w-px bg-gray-200" />

						<Pressable
							onPress={() => onSend(item.id)}
							className="flex-1 items-center justify-center py-3 active:opacity-70"
						>
							<Text className="text-base font-bold text-emerald-600">Enviar</Text>
						</Pressable>

						<View className="w-px bg-gray-200" />

						<Pressable
							onPress={() => onDelete(item.id)}
							className="flex-1 items-center justify-center py-3 active:opacity-70"
						>
							<Text className="text-base font-bold text-red-500">Excluir</Text>
						</Pressable>
					</View>
				</View>
			)}
		/>
	)
}

export default FundiaryCardOffline
