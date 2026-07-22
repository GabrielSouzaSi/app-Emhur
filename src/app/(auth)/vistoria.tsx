import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { useContext, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Alert,
	FlatList,
	Image,
	Keyboard,
	Modal,
	Pressable,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import colors from "tailwindcss/colors"

import { useAuth } from "@/hooks/useAuth"

import { Button } from "@/components/button"
import { DropdownButton } from "@/components/buttonDropdown"
import { CameraSave } from "@/components/CameraSave"
import { GalleryPick } from "@/components/GalleryPick"
import { HeaderBack } from "@/components/headerBack"
import { Holder } from "@/components/Holder"
import { Field } from "@/components/input"
import { InspectionItem } from "@/components/inspectionItem"
import { Loading } from "@/components/loading"
import { Search } from "@/components/search"
import { NetworkContext } from "@/contexts/NetworkContext"
import { addDatabaseInspection } from "@/database/inspection"
import { getDatabaseInspectionLocation } from "@/database/InspectionLocation"
import { getDatabaseReason, getDatabaseReasonItemId } from "@/database/reason"
import { ImageDTO } from "@/dtos/imageDTO"
import { PermitHolderDTO } from "@/dtos/permitHolderDTO"
import { VehicleDTO } from "@/dtos/vehicleDTO"
import { server } from "@/server/api"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

enum MODAL {
	NONE = 0,
	IMAGENS = 1,
	VISTORIA = 2,
	LOCAIS = 3,
}

type FormData = {
	numero: string
	vistoria: number
	local: string
	infracoes: number[]
	status: string
	newVehicle: string
}

export default function Vistoria() {
	const [isLoaded, setIsLoaded] = useState(false)

	const router = useRouter()

	const { isConnect } = useContext(NetworkContext)

	const { user } = useAuth()

	const {
		control,
		handleSubmit,
		formState: { errors },
		getValues,
		setValue,
		clearErrors,
	} = useForm<FormData>()

	const [showNewVehicle, setShowNewVehicle] = useState(false)

	// Informações do Veiculo
	const [vehicle, setVehicle] = useState<VehicleDTO>()
	const [newVehicle, setNewVehicle] = useState<VehicleDTO>()
	const [permitType, setPermitType] = useState<string>("")
	// ID do alvará
	const [alvara, setAlvara] = useState<number>()

	// Dados do Condutor/Infrator
	const [permitHolder, setPermitHolder] = useState<PermitHolderDTO>()
	// Motivos da vistoria
	const [inspectionOptions, setInspectionOptions] = useState([])
	const [inspectionReason, setInspectionReason] = useState<number>()
	// Formulário da vistoria
	const [formData, setFormData] = useState<any>()
	// Locais
	const [listLocations, setListLocations] = useState([])
	const [locations, setLocations] = useState<any>()
	// Status
	const [status, setStatus] = useState<any>()
	// Propaganda
	const [advertising, setAdvertising] = useState("")
	// Obserções
	const [obs, setObs] = useState("")

	// Variável para identificar a troca de veículo
	const TROCA_VEICULO_ID = 6 // exemplo

	// Itens da vitoria
	const [inspectionItems, setInspectionItems] = useState<any>([])
	const [inspectionItemsObject, setInspectionItemsObject] = useState<any>(null)

	// Imagens
	const [imagens, setImagens] = useState<ImagePicker.ImagePickerResult[] | any>([])

	// Modal
	const [modal, setModal] = useState(MODAL.NONE)

	// Buscar veículo
	async function searchPlate(req: any) {
		Keyboard.dismiss()
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/vehicle/${req}`)
			// console.log(JSON.stringify(data, null, 2));

			const { permit_holder_id, vehicle_id } = data
			setAlvara(data.permit_id)
			setVehicle(vehicle_id)
			setPermitHolder(permit_holder_id)
			setPermitType(data.permit_type.name)
		} catch (error) {
			setIsLoaded(false)
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
	}

	// Buscar veículo
	async function searchNewVehicled(req: any) {
		Keyboard.dismiss()
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/vehicles/search?placa=${req}`)
			//console.log(JSON.stringify(data, null, 2))

			setNewVehicle(data.data[0])
		} catch (error) {
			setIsLoaded(false)
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
	}

	// Função para buscar a lista do motivo da vistoria
	async function getInspectionReasons() {
		try {
			const data: any = await getDatabaseReason()
			let result = data.map((data: any) => {
				return {
					label: data.name,
					value: data.id,
				}
			})
			setInspectionOptions(result)
		} catch (error) {
			console.log("Error ao buscar os motivos da vistoria:", error)
		}
	}

	// Função para buscar a lista dos locais da vistoria
	async function getListLocations() {
		try {
			const data: any = await getDatabaseInspectionLocation()
			let result = data.map((data: any) => {
				return {
					label: data.name,
					value: data.id,
				}
			})
			setListLocations(result)
		} catch (error) {
			console.log("Error ao buscar os locais da vistoria:", error)
		}
	}
	// Função para listar os itens da vistoria
	async function inspectionReasonsItems(id: number) {
		setInspectionReason(id)
		try {
			const data: any = await getDatabaseReasonItemId(id)
			let result = data.map((data: any) => {
				return {
					id: data.id,
					item: data.item,
					description: data.description,
					additional_info: "",
					status: "apto",
					exists: true,
				}
			})
			setInspectionItems(result)
		} catch (error) {
			console.log("Error ao buscar os itens da vistoria:", error)
		}
	}

	// Função recebe os dados da vistoria selecionada
	function onSelectInspection(item: any) {
		//console.log(item);

		inspectionReasonsItems(Number(item.value))

		const troca = item.value === TROCA_VEICULO_ID

		setShowNewVehicle(troca)

		if (!troca) {
			setNewVehicle(undefined)
			setValue("newVehicle", "")
			clearErrors("newVehicle")
		}
	}

	// Função recebe os dados do local selecionado
	function onSelectLocation(item: any) {
		// console.log(item);
		setLocations(item)
	}
	// Função recebe os dados do local selecionado
	function onSelectStatus(item: any) {
		// console.log(item);
		setStatus(item)
	}

	// Recebe os dados da imagem e salva no array
	const saveImage = async (img: ImageDTO) => {
		setImagens((prev: any) => [...prev, img])
	}

	// Função para remover imagem
	const removerImagem = (index: number) => {
		setImagens((prev: any) => {
			const updated = prev.filter((_: any, i: number) => i !== index)
			if (updated.length < 1) setModal(MODAL.NONE)
			return updated
		})
	}

	async function postInspection(data: FormData) {
		setIsLoaded(true)
		let currentdate = new Date()
		let date =
			+currentdate.getFullYear() +
			"-" +
			(currentdate.getMonth() + 1) +
			"-" +
			currentdate.getDate()

		let time =
			currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds()

		let formData = new FormData()
		formData.append("permit_id", `${alvara}`)
		formData.append("permit_holder_id", `${permitHolder?.id}`)
		formData.append("vehicle_id", `${vehicle?.id}`)
		formData.append("user_id", `${user?.id} `)
		formData.append("inspection_location_id", `${locations.value}`)
		formData.append("inspection_reason_id", `${inspectionReason}`)
		formData.append("inspection_date", `${date}`)
		formData.append("inspection_time", `${time}`)
		if (showNewVehicle && newVehicle) {
			formData.append("new_vehicle_id", `${newVehicle.id}`)
		}
		formData.append("advertising", `${advertising}`)
		formData.append("final_observations", `${obs ? obs : "Sem observações"}`)
		formData.append("inspection_items", JSON.stringify(inspectionItemsObject))
		formData.append("inspection_result", `${status.value}`)
		imagens.forEach((image: ImageDTO) => {
			formData.append("attachments[]", {
				...image,
				uri: image.uri,
				name: image.name,
				type: image.type,
			} as any)
		})

		//console.log("Checklist salvo", JSON.stringify(formData, null, 2));

		try {
			await server.postForm(`/inspections`, formData)
			Toast.show({
				type: "success",
				text1: "Vistoria enviado com sucesso!",
			})
			router.back()
		} catch (error) {
			console.log("Error ao enviar a vistoria:", error)
			addInspection(data)
		} finally {
			setIsLoaded(false)
		}
	}
	async function addInspection(form: FormData) {
		let currentdate = new Date()
		let date =
			+currentdate.getFullYear() +
			"-" +
			(currentdate.getMonth() + 1) +
			"-" +
			currentdate.getDate()

		let time =
			currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds()

		let inspection = [
			{
				permitHolderId: permitHolder?.id,
				vehicle: form.numero,
				newVehicle: form.newVehicle,
				inspectionLocationId: locations.value,
				inspectionReasonId: inspectionReason,
				data: date,
				hora: time,
				advertising: advertising,
				obs: `${obs ? obs : "Sem observações"}`,
				items: inspectionItems,
				imagens: imagens,
				status: `${status.value}`,
			},
		]

		try {
			await addDatabaseInspection(inspection)
			Toast.show({
				type: "success",
				text1: "Vistoria salvo offline!",
			})
			router.back()
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Algo deu errado!",
				text2: "Não foi possível salvar!",
			})
			console.log("Error ao salvar a vistoria offline:", error)
		}
	}

	const handleSave = (updatedData: any) => {
		// Aqui você pode mandar pra API
		setModal(MODAL.NONE)

		setInspectionItems(updatedData)

		// console.log("Checklist atualizado:", updatedData);

		let inspectionItemss: any = {}

		updatedData.forEach((item: any) => {
			inspectionItemss[item.id] = {
				item: item.item,
				additional_info: item.additional_info,
				status: item.status,
				exists: item.exists,
			}
		})

		// console.log(inspectionItems);

		setInspectionItemsObject(inspectionItemss)

		//Alert.alert("Checklist salvo", JSON.stringify(updatedData, null, 2));
	}

	useEffect(() => {
		getInspectionReasons()
		getListLocations()
	}, [])

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
				<HeaderBack title="Cadastrar Vistoria" variant="primary" />

				<View className="flex p-4">
					{/* Consultar veículo */}
					<View className="flex-row items-center mb-3">
						<View className="flex-1">
							<Controller
								control={control}
								name="numero"
								rules={{
									required: "Informe o Número do Veículo!",
								}}
								render={({ field: { onChange, value } }) => (
									<Search
										errorMessage={errors.numero?.message}
										placeholder="Número do Veículo"
										onChangeText={onChange}
										value={value}
										onSubmitEditing={() => searchPlate(value)}
										returnKeyType="send"
										keyboardType="numeric"
										onSearch={() => searchPlate(value)}
									/>
								)}
							/>
						</View>
					</View>

					{/* Permissionário */}
					<Holder permitHolder={permitHolder} vehicle={vehicle} />

					{permitType !== "" && (
						<View className="mb-4">
							<View>
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Tipo de Alvará
								</Text>
								<Field
									variant="primary"
									placeholder={permitType}
									editable={false}
								/>
							</View>
						</View>
					)}

					<View className="mb-4 gap-4">
						<View>
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Motivo da Vistoria
							</Text>
							<Controller
								control={control}
								name="vistoria"
								rules={{ required: "Selecione o Motivo da Vistoria!" }}
								render={({ field: { onChange, value } }) => (
									<DropdownButton
										data={[...inspectionOptions].sort((a: any, b: any) =>
											a.label.localeCompare(b.label),
										)}
										placeholder="Motivo da Vistoria"
										value={value} // ✅ agora mostra o valor selecionado
										errorMessage={errors.vistoria?.message} // ✅ mostra erro
										onSelect={(item) => {
											onChange(item.value) // ✅ atualiza o valor no formulário
											onSelectInspection(item) // ✅ mantém sua lógica atual também
										}}
									/>
								)}
							/>
						</View>

						{/* Consultar novo veículo */}
						{showNewVehicle && (
							<View className="gap-4 bg-white p-4 rounded-md border-gray-300 border-2">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Informações do Novo Veículo
								</Text>

								<Controller
									control={control}
									name="newVehicle"
									rules={{
										required: showNewVehicle
											? "Informe a placa do novo veículo!"
											: false,
									}}
									render={({ field: { onChange, value } }) => (
										<Search
											errorMessage={errors.newVehicle?.message}
											placeholder="Placa do Novo Veículo"
											onChangeText={onChange}
											value={value}
											onSubmitEditing={() => searchNewVehicled(value)}
											onSearch={() => searchNewVehicled(value)}
											returnKeyType="send"
										/>
									)}
								/>

								<Holder vehicle={newVehicle} />
							</View>
						)}

						{/* {showNewVehicle && (
							<>
								{newVehicle?.id && (
									<>
										<View className="flex">
											<Text className="text-gray-500 font-regular text-2xl font-bold">
												Frente:
											</Text>
											<View className="flex flex-row justify-between my-4">
												<View className="flex-1 mr-2">
													<CameraSave />
												</View>
												<View className="flex-1 ml-2">
													<GalleryPick />
												</View>
											</View>

										</View>

										<View className="flex">
											<Text className="text-gray-500 font-regular text-2xl font-bold">
												Traseira:
											</Text>
											<View className="flex flex-row justify-between my-4">
												<View className="flex-1 mr-2">
													<CameraSave />
												</View>
												<View className="flex-1 ml-2">
													<GalleryPick />
												</View>
											</View>

											
										</View>

										<View className="flex">
											<Text className="text-gray-500 font-regular text-2xl font-bold">
												Lateral direita:
											</Text>
											<View className="flex flex-row justify-between my-4">
												<View className="flex-1 mr-2">
													<CameraSave />
												</View>
												<View className="flex-1 ml-2">
													<GalleryPick />
												</View>
											</View>

										</View>

										<View className="flex">
											<Text className="text-gray-500 font-regular text-2xl font-bold">
												Lateral esquerda:
											</Text>
											<View className="flex flex-row justify-between my-4">
												<View className="flex-1 mr-2">
													<CameraSave />
												</View>
												<View className="flex-1 ml-2">
													<GalleryPick />
												</View>
											</View>
										</View>
									</>
								)}
							</>
						)} */}

						<View>
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Local da Vistoria
							</Text>
							<Controller
								control={control}
								name="local"
								rules={{ required: "Selecione o Local da Vistoria!" }}
								render={({ field: { onChange, value } }) => (
									<DropdownButton
										data={[...listLocations].sort((a: any, b: any) =>
											a.label.localeCompare(b.label),
										)}
										placeholder="Local da Vistoria"
										value={value} // ✅ agora mostra o valor selecionado
										errorMessage={errors.local?.message} // ✅ mostra erro
										onSelect={(item) => {
											onChange(item.value) // ✅ atualiza o valor no formulário
											onSelectLocation(item) // ✅ mantém sua lógica atual também
										}}
									/>
								)}
							/>
						</View>

						{inspectionItems.length > 0 && (
							<Button
								className="mt-4"
								variant="primary"
								onPress={() => setModal(MODAL.VISTORIA)}
							>
								<Button.TextButton title="Itens da Vistoria" />
							</Button>
						)}

						{/* Imagens do Veiculo */}
						<View className="flex flex-row justify-between my-4">
							<View className="flex-1 mr-2">
								{/* Componente da camera */}
								<CameraSave onChange={saveImage} />
							</View>
							<View className="flex-1 ml-2">
								{/* Abrir Galeria */}
								<GalleryPick onChange={saveImage} />
							</View>
						</View>

						{/* Se houver imagem */}
						{imagens.length > 0 ? (
							<Button variant="primary" onPress={() => setModal(MODAL.IMAGENS)}>
								<Button.TextButton title={`Imagens(${imagens.length})`} />
							</Button>
						) : (
							<></>
						)}

						<View>
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Status da Vistoria
							</Text>
							<Controller
								control={control}
								name="status"
								rules={{ required: "Selecione o Status da Vistoria!" }}
								render={({ field: { onChange, value } }) => (
									<DropdownButton
										data={[
											{ label: "Aprovada", value: "Aprovada" },
											{ label: "Reprovada", value: "Reprovada" },
										]}
										placeholder="Status da Vistoria"
										value={value} // ✅ agora mostra o valor selecionado
										errorMessage={errors.status?.message} // ✅ mostra erro
										onSelect={(item) => {
											onChange(item.value) // ✅ atualiza o valor no formulário
											onSelectStatus(item) // ✅ mantém sua lógica atual também
										}}
									/>
								)}
							/>
						</View>

						{/* Observação */}
						<View className="flex mb-5">
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Observação:
							</Text>

							<Field
								placeholder="Descreva o assunto."
								variant="primary"
								onChangeText={setObs}
								value={obs}
								multiline={true}
								numberOfLines={2}
							/>
						</View>
					</View>

					{/* Salvar */}
					<Button variant="primary" onPress={handleSubmit(postInspection)}>
						<Button.TextButton title="ENVIAR" />
					</Button>
				</View>
			</KeyboardAwareScrollView>
			<Modal
				visible={modal === MODAL.IMAGENS}
				animationType="slide"
				onRequestClose={() => setModal(MODAL.NONE)}
			>
				<SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
					<View className="flex-1 p-4">
						<TouchableOpacity
							activeOpacity={0.7}
							className="self-end mb-4"
							onPress={() => setModal(MODAL.NONE)}
						>
							<MaterialCommunityIcons
								name="close-circle-outline"
								size={40}
								color={colors.blue[500]}
							/>
						</TouchableOpacity>
						<FlatList
							data={imagens}
							renderItem={({ item, index }) => (
								<View className="w-full mb-4 bg-white p-2 rounded-md border-gray-300 border-2">
									<Image
										className="h-56 rounded-md"
										source={{
											uri: item.uri,
										}}
										resizeMode="contain"
									/>

									<Pressable
										className="py-4 items-center"
										onPress={() => removerImagem(index)}
									>
										<Text className="text-red-500 font-semiBold text-lg">
											Excluir
										</Text>
									</Pressable>
								</View>
							)}
							showsVerticalScrollIndicator={false}
						/>
					</View>
				</SafeAreaView>
			</Modal>
			<Modal
				visible={modal === MODAL.VISTORIA}
				animationType="slide"
				onRequestClose={() => setModal(MODAL.NONE)}
			>
				<SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
					<View className="flex-1 p-4">
						<View className="flex-row justify-between items-center">
							<Text className="font-semiBold text-xl">Lista de Itens</Text>

							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => setModal(MODAL.NONE)}
							>
								<MaterialCommunityIcons
									name="close-circle-outline"
									size={40}
									color={colors.blue[500]}
								/>
							</TouchableOpacity>
						</View>

						{inspectionItems && (
							<InspectionItem data={inspectionItems} onSave={handleSave} />
						)}
					</View>
				</SafeAreaView>
			</Modal>
			{isLoaded && <Loading />}
		</>
	)
}
