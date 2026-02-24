import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
	Alert,
	FlatList,
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native"

import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/button"
import { DropdownButton } from "@/components/buttonDropdown"
import { CameraSave } from "@/components/CameraSave"
import { GalleryPick } from "@/components/GalleryPick"
import { HeaderBack } from "@/components/headerBack"
import { Field } from "@/components/input"
import { Loading } from "@/components/loading"
import { Modal } from "@/components/modal"
import { delDatabaseFundiaryInspection } from "@/database/fundiaryInspections"
import { getDatabaseFundiaryOccupationType } from "@/database/fundiaryOccupationType"
import { getDatabaseFundiaryUseType } from "@/database/fundiaryUseType"
import { ImageDTO } from "@/dtos/imageDTO"
import { server } from "@/server/api"
import Toast from "react-native-toast-message"

enum MODAL {
	NONE = 0,
	FRONT_LOT_PHOTO = 1,
	EDIFICATION_PHOTO = 2,
	NUMBER_PORT_PHOTO = 3,
	PERSPECTIVE_PHOTO = 4,
	COMPLEMENTS_PHOTO = 5,
}
type FormData = {
	numero: string
	permitType: string
	driverType: string
	abordagem: number
	local: string
	infracoes: number[]
}

type FundiaryInspectionForm = {
	service_order_number: string
	process_number: string
	process_year: string
	requester_name: string
	requester_contact: string
	address: string
	address_number: string
	lot_number: string
	block_number: string
	area_registration_owner: string
	occupation_type_id: string
	use_type_id: string
	environmental_influence_type_id: string
}

export default function Autuacaoes() {
	const ref = useRef<any>(null)

	// informação do usuário

	const [isLoaded, setIsLoaded] = useState(false)

	const router = useRouter()

	const [fundiaryOccupationType, setFundiaryOccupationType] = useState<
		{ label: string; value: string }[]
	>([])
	const [fundiaryUseType, setFundiaryUseType] = useState<{ label: string; value: string }[]>([])
	const [fundiaryEnvironmentalInfluenceType, setFundiaryEnvironmentalInfluenceType] = useState<
		{ label: string; value: string }[]
	>([])

	// Coordenadas GPS
	const [gps, setGps] = useState<Location.LocationObject | null>(null)

	// Imagens
	const [frontLotPhoto, setFrontLotPhoto] = useState<ImageDTO[]>([])
	const [edificationPhoto, setEdificationPhoto] = useState<ImageDTO[]>([])
	const [numberPortPhoto, setNumberPortPhoto] = useState<ImageDTO[]>([])
	const [perspectivePhoto, setPerspectivePhoto] = useState<ImageDTO[]>([])
	const [complementsPhoto, setComplementsPhoto] = useState<ImageDTO[]>([])

	// Observações
	const [obs, setObs] = useState("")

	// Modal
	const [modal, setModal] = useState(MODAL.NONE)

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FundiaryInspectionForm>({
		defaultValues: {
			service_order_number: "",
			process_number: "",
			process_year: "",
			requester_name: "",
			requester_contact: "",
			address: "",
			address_number: "",
			lot_number: "",
			block_number: "",
			area_registration_owner: "",
			occupation_type_id: "",
			use_type_id: "",
			environmental_influence_type_id: "",
		},
	})

	// Recebe os dados das imagens e salva no estado
	const saveImage = async (img: ImageDTO, modalType: MODAL) => {
		switch (modalType) {
			case MODAL.FRONT_LOT_PHOTO:
				setFrontLotPhoto((prev) => [...prev, img])
				break
			case MODAL.EDIFICATION_PHOTO:
				setEdificationPhoto((prev) => [...prev, img])
				break
			case MODAL.NUMBER_PORT_PHOTO:
				setNumberPortPhoto((prev) => [...prev, img])
				break
			case MODAL.PERSPECTIVE_PHOTO:
				setPerspectivePhoto((prev) => [...prev, img])
				break
			case MODAL.COMPLEMENTS_PHOTO:
				setComplementsPhoto((prev) => [...prev, img])
				break
		}
	}

	// Função para trazer os dados da tabela tipo de ocupação fundiária
	async function getTableFundiaryOccupationType() {
		try {
			const data = await getDatabaseFundiaryOccupationType()
			let result = data.map((data: any) => {
				return {
					label: data.name,
					value: data.id,
				}
			})
			setFundiaryOccupationType(result)
		} catch (error) {
			console.log(error)
		}
	}

	// Função para trazer os dados da tabela tipo de uso fundiário
	async function getTableFundiaryUseType() {
		try {
			const data = await getDatabaseFundiaryUseType()
			let result = data.map((data: any) => {
				return {
					label: data.name,
					value: data.id,
				}
			})
			setFundiaryUseType(result)
		} catch (error) {
			console.log(error)
		}
	}

	// Função para remover imagem
	const removerImagem = (modalType: MODAL, index: number) => {
		switch (modalType) {
			case MODAL.FRONT_LOT_PHOTO:
				setFrontLotPhoto((prev) => prev.filter((_, i) => i !== index))
				break
			case MODAL.EDIFICATION_PHOTO:
				setEdificationPhoto((prev) => prev.filter((_, i) => i !== index))
				break
			case MODAL.NUMBER_PORT_PHOTO:
				setNumberPortPhoto((prev) => prev.filter((_, i) => i !== index))
				break
			case MODAL.PERSPECTIVE_PHOTO:
				setPerspectivePhoto((prev) => prev.filter((_, i) => i !== index))
				break
			case MODAL.COMPLEMENTS_PHOTO:
				setComplementsPhoto((prev) => prev.filter((_, i) => i !== index))
				break
		}
	}

	async function getGPS() {
		const status = await statusGPS()
		setGps(status)
	}

	async function handleSubmitForm(data: FundiaryInspectionForm) {
		setIsLoaded(true)

		const form = new FormData()

		// ✅ campos do formulário (vindos do react-hook-form)
		Object.entries(data).forEach(([key, value]) => {
			form.append(key, value ?? "")
		})

		// ✅ observações
		form.append("observations", obs ? obs.trim() : "Sem observações")

		// ✅ imagens
		frontLotPhoto.forEach((photo) => form.append("front_photos[]", photo as any))
		edificationPhoto.forEach((photo) => form.append("edification_photos[]", photo as any))
		numberPortPhoto.forEach((photo) => form.append("port_photos[]", photo as any))
		perspectivePhoto.forEach((photo) => form.append("perspective_photos[]", photo as any))
		complementsPhoto.forEach((photo) => form.append("extra_photos[]", photo as any))

		// ✅ gps
		form.append("latitude", gps?.coords?.latitude?.toString() ?? "")
		form.append("longitude", gps?.coords?.longitude?.toString() ?? "")

		// ⚠️ corrigir nomes (você tem "inspection_tim" e campos vazios)
		form.append("auto_number", "")
		form.append("inspection_date", "")
		form.append("inspection_time", "") // ✅ (corrigido)

		try {
			await server.postForm("/fundiary-inspections", form) // ✅ faltava await
			Toast.show({ type: "success", text1: "Formulário enviado com sucesso!" })
			router.back()
		} catch (error: any) {
			console.log("⚠️ Falha no envio, salvando offline:", error?.message)
			handleSubmitFormOffline(data)
		} finally {
			setIsLoaded(false)
		}
	}

	async function handleSubmitFormOffline(data: FundiaryInspectionForm) {
		try {
			const save = [
				{
					serviceOrderNumber: data.service_order_number,
					processNumber: data.process_number,
					processYear: data.process_year,

					requesterName: data.requester_name,
					requesterContact: data.requester_contact,

					address: data.address,
					addressNumber: data.address_number,
					lotNumber: data.lot_number,
					blockNumber: data.block_number,

					areaRegistrationOwner: data.area_registration_owner,
					observations: obs ? obs.trim() : "Sem observações",

					occupationTypeId: data.occupation_type_id,
					useTypeId: data.use_type_id,
					environmentalInfluenceTypeId: data.environmental_influence_type_id,

					frontPhotos: frontLotPhoto,
					edificationPhotos: edificationPhoto,
					portPhotos: numberPortPhoto,
					perspectivePhotos: perspectivePhoto,
					extraPhotos: complementsPhoto,

					latitude: gps?.coords?.latitude?.toString() ?? "",
					longitude: gps?.coords?.longitude?.toString() ?? "",
				},
			]

			await delDatabaseFundiaryInspection(save)
			Toast.show({
				type: "success",
				text1: "Dados salvos offline!",
			})
			router.back()
		} catch (error) {
			Toast.show({
				type: "success",
				text1: "Algo deu errado!",
				text2: "Não foi possível salvar!",
			})
			console.log(error)
		}
	}

	// Solicitar permissão
	async function getPermissionGPS() {
		const { status } = await Location.requestForegroundPermissionsAsync()

		if (status !== "granted") {
			Alert.alert("Permissão negada", "Dê permissão da localização para continuar.", [
				{ text: "OK", onPress: () => getPermissionGPS() },
			])
			return
		} else {
			await statusGPS()
		}
	}
	// Verificar se o GPS está ativado
	async function statusGPS(): Promise<Location.LocationObject | null> {
		const isGPSEnabled = await Location.hasServicesEnabledAsync()

		if (!isGPSEnabled) {
			Alert.alert("GPS desativado", "Ative o GPS para capturar a localização.")
			return null
		}

		return await Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.High,
		})
	}

	useEffect(() => {
		getPermissionGPS()
		getTableFundiaryOccupationType()
		getTableFundiaryUseType()
	}, [])

	return (
		<>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
				>
					<View>
						{/* Cabeçalho */}
						<HeaderBack title="Formulário Fundiário" variant="primary" />

						<View className="flex p-4">
							{/* Nº da Ordem de Serviço e Nº do Processo */}
							<View className="flex-row justify-between gap-4 mb-4">
								<View className="flex-1">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										Ordem de Serviço:
									</Text>
									<Controller
										control={control}
										name="service_order_number"
										rules={{ required: "Campo obrigatório!" }}
										render={({ field: { onChange, value } }) => (
											<Field
												placeholder="Ordem de Serviço"
												variant="primary"
												onChangeText={onChange}
												value={value}
											/>
										)}
									/>
									{errors.service_order_number?.message ? (
										<Text className="text-red-500">
											{errors.service_order_number.message}
										</Text>
									) : null}
								</View>
								<View className="flex-1">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										Nº do Processo:
									</Text>
									<Controller
										control={control}
										name="process_number"
										rules={{ required: "Informe o nº do processo" }}
										render={({ field: { onChange, value } }) => (
											<Field
												placeholder="Número do Processo"
												variant="primary"
												onChangeText={onChange}
												value={value}
											/>
										)}
									/>
									{errors.process_number?.message ? (
										<Text className="text-red-500">
											{errors.process_number.message}
										</Text>
									) : null}
								</View>
							</View>

							{/* Ano do Processo */}
							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Ano do Processo:
								</Text>
								<Controller
									control={control}
									name="process_year"
									rules={{ required: "Informe o ano do processo" }}
									render={({ field: { onChange, value } }) => (
										<Field
											placeholder="Ano do Processo"
											variant="primary"
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
								{errors.process_year?.message ? (
									<Text className="text-red-500">
										{errors.process_year.message}
									</Text>
								) : null}
							</View>

							{/* Requerente */}
							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Requerente:
								</Text>
								<Controller
									control={control}
									name="requester_name"
									rules={{ required: "Informe o nome do requerente" }}
									render={({ field: { onChange, value } }) => (
										<Field
											placeholder="Nome do Requerente"
											variant="primary"
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
								{errors.requester_name?.message ? (
									<Text className="text-red-500">
										{errors.requester_name.message}
									</Text>
								) : null}
							</View>

							{/* Contato do Requerente */}
							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Contato:
								</Text>
								<Controller
									control={control}
									name="requester_contact"
									rules={{
										validate: (v) => {
											if (!v || !v.trim()) return true // vazio = OK
											return v.trim().length >= 8 || "Contato muito curto"
										},
									}}
									render={({ field: { onChange, value } }) => (
										<Field
											placeholder="Contato do Requerente"
											variant="primary"
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
								{errors.requester_contact?.message ? (
									<Text className="text-red-500">
										{errors.requester_contact.message}
									</Text>
								) : null}
							</View>

							{/* Endereço */}
							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Endereço:
								</Text>
								<Controller
									control={control}
									name="address"
									rules={{ required: "Informe o endereço" }}
									render={({ field: { onChange, value } }) => (
										<Field
											placeholder="Endereço completo"
											variant="primary"
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
								{errors.address?.message ? (
									<Text className="text-red-500">{errors.address.message}</Text>
								) : null}
							</View>

							{/* Número do Endereço */}
							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Nº de Porta:
								</Text>
								<Controller
									control={control}
									name="address_number"
									rules={{ required: "Informe o número" }}
									render={({ field: { onChange, value } }) => (
										<Field
											placeholder="Número do Endereço"
											variant="primary"
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
								{errors.address_number?.message ? (
									<Text className="text-red-500">
										{errors.address_number.message}
									</Text>
								) : null}
							</View>

							{/* Lote e Quadra */}
							<View className="flex mb-4">
								<View className="flex-row justify-between gap-4">
									<View className="flex-1">
										<Text className="text-gray-500 font-regular text-2xl font-bold">
											Nº do Lote:
										</Text>
										<Controller
											control={control}
											name="lot_number"
											rules={{ required: "Informe o número do lote" }}
											render={({ field: { onChange, value } }) => (
												<Field
													placeholder="Número do Lote"
													variant="primary"
													onChangeText={onChange}
													value={value}
												/>
											)}
										/>
										{errors.lot_number?.message ? (
											<Text className="text-red-500">
												{errors.lot_number.message}
											</Text>
										) : null}
									</View>

									<View className="flex-1">
										<Text className="text-gray-500 font-regular text-2xl font-bold">
											Nº do Quadra:
										</Text>
										<Controller
											control={control}
											name="block_number"
											rules={{ required: "Informe o número da quadra" }}
											render={({ field: { onChange, value } }) => (
												<Field
													placeholder="Número da Quadra"
													variant="primary"
													onChangeText={onChange}
													value={value}
												/>
											)}
										/>
										{errors.block_number?.message ? (
											<Text className="text-red-500">
												{errors.block_number.message}
											</Text>
										) : null}
									</View>
								</View>
							</View>

							<Button className="mb-4" variant="primary" onPress={getGPS}>
								<Button.TextButton title="Marcar Posição" />
							</Button>

							{gps && (
								<View className="flex mb-4">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										Posição GPS: {gps?.coords?.latitude},{" "}
										{gps?.coords?.longitude}
									</Text>
								</View>
							)}

							{/* Matrícula da Área/Proprietário */}
							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Matricula da Área/Proprietário:
								</Text>
								<Controller
									control={control}
									name="area_registration_owner"
									// rules={{ required: "Informe a matrícula da área/proprietário" }}
									render={({ field: { onChange, value } }) => (
										<Field
											placeholder="Matrícula da Área/Proprietário"
											variant="primary"
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
								{errors.area_registration_owner?.message ? (
									<Text className="text-red-500">
										{errors.area_registration_owner.message}
									</Text>
								) : null}
							</View>

							{/* Tipo de Ocupação */}
							<View className="mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Tipo de Ocupação:
								</Text>
								<Controller
									control={control}
									name="occupation_type_id"
									rules={{ required: "Selecione o tipo de ocupação!" }}
									render={({ field: { onChange, value } }) => (
										<DropdownButton
											data={fundiaryOccupationType}
											placeholder="Ocupação"
											value={value}
											errorMessage={errors.occupation_type_id?.message}
											onSelect={(item) => onChange(item.value)}
										/>
									)}
								/>
							</View>

							{/* Tipo de Uso */}
							<View className="mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Tipo de Uso:
								</Text>
								<Controller
									control={control}
									name="use_type_id"
									rules={{ required: "Selecione o tipo de uso!" }}
									render={({ field: { onChange, value } }) => (
										<DropdownButton
											data={fundiaryUseType}
											placeholder="Tipo de Uso"
											value={value}
											errorMessage={errors.use_type_id?.message}
											onSelect={(item) => onChange(item.value)}
										/>
									)}
								/>
							</View>

							{/* Influência Ambiental */}
							<View className="mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Tipo de Influência Ambiental:
								</Text>
								<Controller
									control={control}
									name="environmental_influence_type_id"
									// rules={{
									// 	required: "Selecione o tipo de influência ambiental!",
									// }}
									render={({ field: { onChange, value } }) => (
										<DropdownButton
											data={fundiaryEnvironmentalInfluenceType}
											placeholder="Tipo de Influência Ambiental"
											value={value}
											errorMessage={
												errors.environmental_influence_type_id?.message
											}
											onSelect={(item) => onChange(item.value)}
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
								/>
							</View>

							{/* Imagens */}
							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Frente do Lote(Uma foto):
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										{/* Componente da camera */}
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.FRONT_LOT_PHOTO)
											}
											disabled={frontLotPhoto.length >= 1} // Desabilita se já tiver uma foto
										/>
									</View>
									<View className="flex-1 ml-2">
										{/* Abrir Galeria */}
										<GalleryPick
											onChange={(img) =>
												saveImage(img, MODAL.FRONT_LOT_PHOTO)
											}
											disabled={frontLotPhoto.length >= 1} // Desabilita se já tiver uma foto
										/>
									</View>
								</View>

								{/* Se houver imagem */}
								{frontLotPhoto.length > 0 ? (
									<Button
										className="mb-4"
										variant="primary"
										onPress={() => setModal(MODAL.FRONT_LOT_PHOTO)}
									>
										<Button.TextButton
											title={`Imagens(${frontLotPhoto.length})`}
										/>
									</Button>
								) : (
									<></>
								)}
							</View>

							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Foto do Nº de Porta(Uma foto):
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										{/* Componente da camera */}
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.NUMBER_PORT_PHOTO)
											}
											disabled={numberPortPhoto.length >= 1} // Desabilita se já tiver uma foto
										/>
									</View>
									<View className="flex-1 ml-2">
										{/* Abrir Galeria */}
										<GalleryPick
											onChange={(img) =>
												saveImage(img, MODAL.NUMBER_PORT_PHOTO)
											}
											disabled={numberPortPhoto.length >= 1} // Desabilita se já tiver uma foto
										/>
									</View>
								</View>

								{/* Se houver imagem */}
								{numberPortPhoto.length > 0 ? (
									<Button
										className="mb-4"
										variant="primary"
										onPress={() => setModal(MODAL.NUMBER_PORT_PHOTO)}
									>
										<Button.TextButton
											title={`Imagens(${numberPortPhoto.length})`}
										/>
									</Button>
								) : (
									<></>
								)}
							</View>

							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Edificação(Uma foto):
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										{/* Componente da camera */}
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.EDIFICATION_PHOTO)
											}
											disabled={edificationPhoto.length >= 1} // Desabilita se já tiver uma foto
										/>
									</View>
									<View className="flex-1 ml-2">
										{/* Abrir Galeria */}
										<GalleryPick
											onChange={(img) =>
												saveImage(img, MODAL.EDIFICATION_PHOTO)
											}
											disabled={edificationPhoto.length >= 1} // Desabilita se já tiver uma foto
										/>
									</View>
								</View>

								{/* Se houver imagem */}
								{edificationPhoto.length > 0 ? (
									<Button
										className="mb-4"
										variant="primary"
										onPress={() => setModal(MODAL.EDIFICATION_PHOTO)}
									>
										<Button.TextButton
											title={`Imagens(${edificationPhoto.length})`}
										/>
									</Button>
								) : (
									<></>
								)}
							</View>

							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Pespectiva:
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										{/* Componente da camera */}
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.PERSPECTIVE_PHOTO)
											}
											//disabled={edificationPhoto.length >= 1} // Desabilita se já tiver uma foto
										/>
									</View>
									<View className="flex-1 ml-2">
										{/* Abrir Galeria */}
										<GalleryPick
											onChange={(img) =>
												saveImage(img, MODAL.PERSPECTIVE_PHOTO)
											}
											disabled={perspectivePhoto.length >= 1} // Desabilita se já tiver uma foto
										/>
									</View>
								</View>

								{/* Se houver imagem */}
								{perspectivePhoto.length > 0 ? (
									<Button
										className="mb-4"
										variant="primary"
										onPress={() => setModal(MODAL.PERSPECTIVE_PHOTO)}
									>
										<Button.TextButton
											title={`Imagens(${perspectivePhoto.length})`}
										/>
									</Button>
								) : (
									<></>
								)}
							</View>

							<View className="flex mb-5">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Foto Complementar:
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										{/* Componente da camera */}
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.COMPLEMENTS_PHOTO)
											}
										/>
									</View>
									<View className="flex-1 ml-2">
										{/* Abrir Galeria */}
										<GalleryPick
											onChange={(img) =>
												saveImage(img, MODAL.COMPLEMENTS_PHOTO)
											}
										/>
									</View>
								</View>

								{/* Se houver imagem */}
								{complementsPhoto.length > 0 ? (
									<Button
										className="mb-4"
										variant="primary"
										onPress={() => setModal(MODAL.COMPLEMENTS_PHOTO)}
									>
										<Button.TextButton
											title={`Imagens(${complementsPhoto.length})`}
										/>
									</Button>
								) : (
									<></>
								)}
							</View>

							{/* Salvar */}
							<Button variant="primary" onPress={handleSubmit(handleSubmitForm)}>
								<Button.TextButton title="ENVIAR" />
							</Button>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
			{/* Modal de exibição das imagens */}

			<Modal
				className="bg-gray-200"
				variant="primary"
				visible={
					modal === MODAL.FRONT_LOT_PHOTO
						? true
						: modal === MODAL.EDIFICATION_PHOTO
							? true
							: modal === MODAL.NUMBER_PORT_PHOTO
								? true
								: modal === MODAL.COMPLEMENTS_PHOTO
									? true
									: false
				}
				onClose={() => setModal(MODAL.NONE)}
			>
				<View className="flex-1">
					<FlatList
						data={
							modal === MODAL.FRONT_LOT_PHOTO
								? frontLotPhoto
								: modal === MODAL.EDIFICATION_PHOTO
									? edificationPhoto
									: modal === MODAL.NUMBER_PORT_PHOTO
										? numberPortPhoto
										: modal === MODAL.COMPLEMENTS_PHOTO
											? complementsPhoto
											: []
						}
						keyExtractor={(_, index) => index.toString()}
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
									onPress={() => removerImagem(modal, index)}
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
			</Modal>
			{isLoaded && <Loading />}
		</>
	)
}
