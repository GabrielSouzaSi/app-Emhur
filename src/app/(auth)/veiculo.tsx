import { HeaderBack } from "@/components/headerBack"
import { Holder } from "@/components/Holder"
import { Loading } from "@/components/loading"
import { Search } from "@/components/search"
import { PermitHolderDTO } from "@/dtos/permitHolderDTO"
import { VehicleDTO } from "@/dtos/vehicleDTO"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Keyboard, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

type VehicleSearch = {
	vehicle: number | string
}

export default function Veiculo() {
	const [isLoaded, setIsLoaded] = useState(false)

	const { user } = useAuth()

	const {
		control,
		formState: { errors },
	} = useForm<VehicleSearch>()

	// Informações do Veiculo
	const [vehicle, setVehicle] = useState<VehicleDTO>()
	const [numero, setNumero] = useState("")
	// Dados do Condutor/Infrator
	const [permitHolder, setPermitHolder] = useState<PermitHolderDTO>()

	// Buscar veículo
	async function searchPlate(req: any) {
		Keyboard.dismiss()
		setVehicle(undefined)
		setPermitHolder(undefined)
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/vehicle/${req}`)
			console.log(data)

			const { permit_holder_id, vehicle_id } = data ?? {}
			setVehicle(vehicle_id ?? undefined)
			setPermitHolder(permit_holder_id ?? undefined)
		} catch (error) {
			throw error
		} finally {
			setIsLoaded(false)
		}
	}

	return (
		<>
			<KeyboardAwareScrollView
				enableOnAndroid
				extraScrollHeight={40}
				keyboardOpeningTime={0}
				contentContainerStyle={{ paddingBottom: 40 }}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<HeaderBack title="Veículo" variant="primary" />

				<View className="flex p-4">
					{/* Consultar veículo */}
					<View className="flex-row items-center mb-4">
						<View className="flex-1">
							<Search
								placeholder="placa ou número"
								onChangeText={setNumero}
								onSubmitEditing={() => searchPlate(numero)}
								value={numero}
								returnKeyType="send"
								keyboardType="default"
								autoCapitalize="characters"
								onSearch={() => searchPlate(numero)}
							/>
							<Controller
								control={control}
								name="vehicle"
								rules={{
									required: "Informe o Número do Veículo!",
								}}
								render={({ field: { onChange, value } }) => (
									<Search
										errorMessage={errors.vehicle?.message}
										placeholder="Número ou Placa do Veículo"
										onChangeText={onChange}
										value={value}
										onSubmitEditing={() => searchPlate(value)}
										returnKeyType="send"
										keyboardType="default"
										autoCapitalize="characters"
										onSearch={() => searchPlate(value)}
									/>
								)}
							/>
						</View>
					</View>

					{/* Permissionário */}
					<Holder permitHolder={permitHolder} vehicle={vehicle} />
				</View>

				{isLoaded && <Loading />}
			</KeyboardAwareScrollView>
		</>
	)
}
