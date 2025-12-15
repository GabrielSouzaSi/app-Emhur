import { useEffect, useState } from "react"
import { Image, ScrollView, Text, View } from "react-native"

import { useLocalSearchParams } from "expo-router"

import { HeaderBack } from "@/components/headerBack"
import { Holder } from "@/components/Holder"
import { LoadingLight, LoadingTop } from "@/components/loading"
import { server } from "@/server/api"

type ViolationCode = {
	code: string
	description: string
}

export default function IdAutuacao() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const [isLoaded, setIsLoaded] = useState(false)
	const [img, setImg] = useState([])
	const [approach, setApproach] = useState<any>()
	const [description, setDescription] = useState("")
	const [signatureBase64, setSignatureBase64] = useState("")
	const [code, setCode] = useState<ViolationCode[]>([])
	const [permitHolder, setPermitHolder] = useState<any>()
	const [loading, setLoading] = useState({}) // controla loading individual

	function handleLoadStart(uri) {
		setLoading((prev) => ({ ...prev, [uri]: true }))
	}

	function handleLoadEnd(uri) {
		setLoading((prev) => ({ ...prev, [uri]: false }))
	}

	function parseAttachments(value: any): string[] {
		if (!value) return []

		// já é array
		if (Array.isArray(value)) return value

		// não é string
		if (typeof value !== "string") return []

		// tenta converter
		try {
			const parsed = JSON.parse(value)
			return Array.isArray(parsed) ? parsed : []
		} catch {
			return []
		}
	}

	async function getViolationCode() {
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/violation/show/${id}`)
			const { violation, violationCodes } = data

			setPermitHolder(violation)

			const attachments = parseAttachments(violation.attachments)
			setImg(attachments)

			setApproach(violation.approach)
			setCode(violationCodes)
			setSignatureBase64(violation.signature_base64)
			setDescription(violation.description)
		} catch (error) {
			throw error
		} finally {
			setIsLoaded(false)
		}
	}

	useEffect(() => {
		if (!id) return
		getViolationCode()
	}, [id])
	return (
		<View>
			{/* Cabeçalho */}
			<HeaderBack
				title={`Autuação Nº ${permitHolder?.auto_number || ""}`}
				variant="primary"
			/>
			{isLoaded ? (
				<LoadingTop />
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 100 }}
				>
					<View className="flex px-4">
						{/* Numero da infração */}

						{/* Permissionário */}
						<Holder
							permitHolder={permitHolder?.permit_holder}
							vehicle={permitHolder?.vehicle}
						/>

						{/* Dados do Condutor */}
						{!(permitHolder?.driver_name == permitHolder?.permit_holder.name) && (
							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Dados do Condutor:
								</Text>
								<View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
									<View className="flex flex-row justify-between mb-4 gap-4">
										<View className="flex-1">
											<Text className="text-gray-500 font-regular text-2xl font-bold">
												Nome:
											</Text>
											<View className="bg-gray-300 rounded-md p-3">
												<Text className="font-semiBold text-lg">
													{permitHolder?.driver_name}
												</Text>
											</View>
										</View>
									</View>

									<View className="flex flex-row justify-between mb-4 gap-4">
										<View className="flex-1">
											<Text className="text-gray-500 font-regular text-2xl font-bold">
												CPF:
											</Text>
											<View className="bg-gray-300 rounded-md p-3">
												<Text className="font-semiBold text-lg">
													{permitHolder?.driver_cpf.slice(0, 3)}*****
												</Text>
											</View>
										</View>
										<View className="flex-1">
											<Text className="text-gray-500 font-regular text-2xl font-bold">
												CNH:
											</Text>
											<View className="bg-gray-300 rounded-md p-3">
												<Text className="font-semiBold text-lg">
													{permitHolder?.driver_cnh.slice(0, 3)}*****
												</Text>
											</View>
										</View>
									</View>
								</View>
							</View>
						)}

						{/* Modo de abordagem */}
						<View>
							<Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
								Modo de abordagem:
							</Text>
							<View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
								<Text className="font-semiBold text-lg">{approach?.name}</Text>
							</View>
						</View>

						{/* Dados da Infração */}
						<View>
							<Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
								Infrações:{` (${code?.length})`}
							</Text>
							<View className="">
								{code?.map((item, index) => (
									<View
										key={index}
										className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4"
									>
										<Text className="font-semiBold text-lg">{`0${index + 1} - ${
											item.code
										}: ${item.description} `}</Text>
									</View>
								))}
							</View>

							{/* <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">{code}</Text>
            </View> */}
						</View>
						{signatureBase64 && (
							<View className="flex-1 justify-center items-center gap-4 mt-3">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Assinatura:
								</Text>
								<Image
									source={{
										uri: signatureBase64,
									}} // URL da imagem
									className="w-3/4 h-40 md:w-full md:h-64" // Altura ajustada pela proporção desejada
									resizeMode="contain" // Ajusta o modo de redimensionamento para conter a imagem
								/>
							</View>
						)}

						{/* Observação */}
						<View className="flex mb-5">
							<Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
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
			)}
		</View>
	)
}
