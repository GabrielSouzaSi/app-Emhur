import { HeaderBack } from "@/components/headerBack"
import { Loading } from "@/components/loading"
import { Section } from "@/components/section"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"

export default function CredencialFiscal() {
	const { user } = useAuth()
	const [isLoaded, setIsLoaded] = useState(false)
	const [fiscal, setFiscal] = useState<any>()

	async function getInfoFiscal() {
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/agent/${user.id}`)
			setFiscal(data)
		} catch (error) {
			throw error
		} finally {
			setIsLoaded(false)
		}
	}
	useEffect(() => {
		getInfoFiscal()
	}, [])
	return (
		<View className="flex-1">
			<HeaderBack title="Credencial" variant="primary" />
			{fiscal ? (
				<Section>
					<View className="items-center justify-center mb-5">
						<MaterialCommunityIcons name="account-box-outline" size={90} />
					</View>

					<View className="flex flex-row justify-between mb-4 gap-4">
						<View className="flex-1">
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Nome:
							</Text>
							<View className="bg-gray-300 rounded-md p-3">
								<Text className="font-semiBold text-lg">{user.name ?? "N/A"}</Text>
							</View>
						</View>
					</View>

					<View className="flex flex-row justify-between mb-4 gap-4">
						<View className="flex-1">
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Matrícula:
							</Text>
							<View className="bg-gray-300 rounded-md p-3">
								<Text className="font-semiBold text-lg">
									{fiscal.matricula ?? "N/A"}
								</Text>
							</View>
						</View>
					</View>
					<View className="flex flex-row justify-between mb-4 gap-4">
						<View className="flex-1">
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Setor:
							</Text>
							<View className="bg-gray-300 rounded-md p-3">
								<Text className="font-semiBold text-lg">
									{fiscal.setor ?? "N/A"}
								</Text>
							</View>
						</View>
					</View>
					<View className="flex flex-row justify-between mb-4 gap-4">
						<View className="flex-1">
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Cargo:
							</Text>
							<View className="bg-gray-300 rounded-md p-3">
								<Text className="font-semiBold text-lg">
									{fiscal.cargo ?? "N/A"}
								</Text>
							</View>
						</View>
					</View>
				</Section>
			) : (
				<Loading />
			)}
		</View>
	)
}
