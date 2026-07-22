import { Image, Text, View } from "react-native"

type HolderAndVehicle = {
	permitHolder?: any
	vehicle?: any
}

export function Holder({ permitHolder, vehicle }: HolderAndVehicle) {
	//console.log(permitHolder)
	//console.log(vehicle)

	return (
		<>
			{/* Veiculo */}
			{vehicle?.id && (
				<View>
					<Text className="text-gray-500 font-regular text-2xl font-bold">Veículo:</Text>
					<View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
						<View className="flex flex-row justify-between mb-4 gap-4">
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Placa:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<Text className="font-semiBold text-lg">
										{vehicle.plate_number}
									</Text>
								</View>
							</View>
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Marca:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<Text className="font-semiBold text-lg">{vehicle.mark}</Text>
								</View>
							</View>
						</View>

						<View className="flex flex-row justify-between mb-4 gap-4">
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Modelo:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<Text className="font-semiBold text-lg">{vehicle.model}</Text>
								</View>
							</View>
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Cor:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<Text className="font-semiBold text-lg">{vehicle.color}</Text>
								</View>
							</View>
						</View>

						<View className="flex flex-row justify-between mb-4 gap-4">
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Ano:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<Text className="font-semiBold text-lg">{vehicle.year}</Text>
								</View>
							</View>
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Renavam:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<Text className="font-semiBold text-lg">
										{vehicle.renavam.slice(0, 3)}*****
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
			)}

			{/* Dados do Condutor */}
			{permitHolder?.id && (
				<View className="flex">
					<Text className="text-gray-500 font-regular text-2xl font-bold">
						Dados do Permissionário:
					</Text>
					<View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
						<View className="flex flex-row justify-between mb-4 gap-4">
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Nome:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<Text className="font-semiBold text-lg">
										{permitHolder.name}
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
										{permitHolder.cpf.slice(0, 3)}*****
									</Text>
								</View>
							</View>
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									CNH:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<Text className="font-semiBold text-lg">
										{permitHolder.cnh.slice(0, 3)}*****
									</Text>
								</View>
							</View>
						</View>

						<View className="flex flex-row justify-between mb-4 gap-4">
							<View className="flex-1">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Foto:
								</Text>
								<View className="bg-gray-300 rounded-md p-3">
									<View className="w-full h-64 items-center justify-center">
										<Image
											source={{
												uri: `https://emhur.conexo.solutions/storage/${permitHolder.foto}`,
											}}
											className="w-full h-64"
											resizeMode="contain"
										/>
									</View>
								</View>
							</View>
						</View>

						{/* <View className="flex-1 justify-center items-center gap-4">
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
						</View> */}
					</View>
				</View>
			)}
		</>
	)
}
