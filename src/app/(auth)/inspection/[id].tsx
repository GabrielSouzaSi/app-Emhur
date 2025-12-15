import { useEffect, useState } from "react"
import { Image, ScrollView, Text, View } from "react-native"

import { useLocalSearchParams } from "expo-router"

import { HeaderBack } from "@/components/headerBack"
import { Holder } from "@/components/Holder"
import { Loading, LoadingLight } from "@/components/loading"
import { getDatabaseReasonId } from "@/database/reason"
import { VehicleDTO } from "@/dtos/vehicleDTO"
import { server } from "@/server/api"

export default function IdInspection() {
	const { id } = useLocalSearchParams()
	const [isLoaded, setIsLoaded] = useState(false)
	const [vehicle, setVehicle] = useState<VehicleDTO>()
	const [img, setImg] = useState([])
	const [info, setInfo] = useState<any>()
	const [reason, setReason] = useState<string>("")

	// Condutor
	const [condutor, setCondutor] = useState<any>(false)
	const [description, setDescription] = useState("")
	const [loading, setLoading] = useState({}) // controla loading individual

	function handleLoadStart(uri) {
		setLoading((prev) => ({ ...prev, [uri]: true }))
	}

	function handleLoadEnd(uri) {
		setLoading((prev) => ({ ...prev, [uri]: false }))
	}

	async function getInspectionID() {
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/inspection/show/${id}`)

			const { inspection } = data

			setVehicle(inspection.permit.vehicle)
			setCondutor(inspection.permit.holder)
			setDescription(data.inspection.final_observations)
			const arr = data.inspection.attachments
			setImg(arr)

			setInfo({
				autoNumber: inspection.auto_number,
				date: inspection.inspection_date,
				time: inspection.inspection_time,
				result: inspection.inspection_result,
				reason: inspection.inspection_reason_id,
				location: inspection.inspection_location_id,
				inspectionItems: Object.entries(inspection.inspection_items),
			})
		} catch (error) {
			throw error
		} finally {
			setIsLoaded(false)
		}
	}

	// Função para listar os itens da vistoria
	async function inspectionReasonsItems(id: number) {
		try {
			const data = await getDatabaseReasonId(id)
			if (data) {
				setReason(data.name)
			} else {
				setReason("")
				alert(
					"Motivo da vistoria não encontrado no banco de dados local. Atualize o aplicativo e tente novamente."
				)
			}
		} catch (error) {
			console.log(error)
		}
	}

	useEffect(() => {
		getInspectionID()
	}, [])
	useEffect(() => {
		if (!info?.reason) return // só entra se info existir e tiver reason

		inspectionReasonsItems(Number(info.reason))
	}, [info?.reason]) // dependência mais específica

	return (
		<View>
			{/* Cabeçalho */}
			<HeaderBack title={`Vistoria Nº${info?.autoNumber || ""}`} variant="primary" />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 100 }}
			>
				<View className="flex p-4">
					<View className="mb-4">
						<Text className="text-gray-500 font-bold text-2xl">Data e Hora:</Text>
						<View className="bg-white rounded-md p-2 border-2 border-gray-300">
							<Text className="font-semibold text-lg">
								{info?.date} - {info?.time}
							</Text>
						</View>
					</View>

					<View className="mb-4">
						<Text className="text-gray-500 font-bold text-2xl">Resultado:</Text>
						<View className="bg-white rounded-md p-2 border-2 border-gray-300">
							<Text className="font-semibold text-lg">{info?.result}</Text>
						</View>
					</View>

					{/* Veiculo e Permissionário */}
					<Holder permitHolder={condutor} vehicle={vehicle} />

					{/* Motivo da Vistoria */}
					<View className="">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Motivo da Vistoria:
						</Text>
						<View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
							<Text className="font-semibold text-lg">{reason}</Text>
						</View>
					</View>

					{/* Local da Vistoria */}
					<View className="flex">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Local da Vistoria:
						</Text>

						<View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
							<Text className="font-semiBold text-lg">Emhur</Text>
						</View>
					</View>

					{/*Exibir itens de vistoria */}
					<View>
						<Text className="text-gray-500 font-bold text-2xl">Itens da Vistoria:</Text>

						{info?.inspectionItems?.map(([key, item]) => (
							<View
								key={key}
								className="bg-white border-2 border-gray-300 rounded-md mb-4 p-3"
							>
								<Text className="font-bold">
									Item: {key} - {item.item ? item.item : ""}
								</Text>
								<Text>Existe: {item.exists ? "Sim" : "Não"}</Text>
								<Text>Status: {item.status}</Text>
								{item.additional_info && (
									<Text>Info adicional: {item.additional_info}</Text>
								)}
							</View>
						))}
					</View>

					{/* Observação */}
					<View className="flex">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Observação:
						</Text>
						<View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
							<Text className="font-semiBold text-lg">{description}</Text>
						</View>
					</View>
					<View className="flex-1 justify-center items-center gap-4">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Imagens:
						</Text>
						{img.map((item) => {
							const uri = `https://emhur.conexo.solutions/storage/${item}`

							return (
								<View
									key={item}
									className="w-full h-64 items-center justify-center"
								>
									{loading[uri] && <LoadingLight />}

									<Image
										source={{ uri }}
										className="w-full h-64"
										resizeMode="contain"
										onLoadStart={() => handleLoadStart(uri)}
										onLoadEnd={() => handleLoadEnd(uri)}
									/>
								</View>
							)
						})}
					</View>
				</View>
			</ScrollView>
			{isLoaded ? <Loading /> : ""}
		</View>
	)
}
