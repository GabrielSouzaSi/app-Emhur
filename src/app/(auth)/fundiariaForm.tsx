import * as Haptics from "expo-haptics"
import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as Sharing from "expo-sharing"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Alert,
	FlatList,
	Image,
	InteractionManager,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native"
import { captureRef } from "react-native-view-shot"

import { Button } from "@/components/button"
import { DropdownButton } from "@/components/buttonDropdown"
import { CameraSave } from "@/components/CameraSave"
import { DropdownButton as RNDropdownButton } from "@/components/DropdownButton"
import { GalleryPick } from "@/components/GalleryPick"
import { HeaderBack } from "@/components/headerBack"
import { Field } from "@/components/input"
import { Loading } from "@/components/loading"
import { Modal } from "@/components/modal"
import { getDatabaseFundiaryEnvironmentalInfluenceType } from "@/database/fundiaryEnvironmentalInfluenceType"
import {
	addDatabaseFundiaryInspection,
	delDatabaseFundiaryInspection,
	getDatabaseFundiaryInspectionById,
	updateDatabaseFundiaryInspection,
} from "@/database/fundiaryInspections"
import { getDatabaseFundiaryOccupationType } from "@/database/fundiaryOccupationType"
import { getDatabaseFundiaryUseType } from "@/database/fundiaryUseType"
import { getDatabaseNeighborhood } from "@/database/neighborhood"
import { FundiaryInspectionDTO } from "@/dtos/FundiaryInspectionDTO"
import { ImageDTO } from "@/dtos/imageDTO"
import { server } from "@/server/api"
import { maskPhone } from "@/utils/maskPhone"
import { maskProcess } from "@/utils/maskProcess"
import Toast from "react-native-toast-message"

enum MODAL {
	NONE = 0,
	FRONT_LOT_PHOTO = 1,
	EDIFICATION_PHOTO = 2,
	NUMBER_PORT_PHOTO = 3,
	PERSPECTIVE_PHOTO = 4,
	COMPLEMENTS_PHOTO = 5,
}

type FundiaryInspectionForm = {
	service_order_number: string
	service_order_year: string
	process_number: string
	process_year: string
	requester_name: string
	requester_contact: string
	address: string
	neighborhood_id: string
	address_number: string
	lot_number: string
	block_number: string
	area_registration_owner: string
	occupation_type_id: string
	use_type_id: string
	environmental_influence_type_id: string
	confrontation_right: string
	confrontation_left: string
	confrontation_back: string
	zone: string
	latitude: string
	longitude: string
	observations: string
}

export default function FundiaryInspectionForm() {
	const [isLoaded, setIsLoaded] = useState(false)
	const [isGettingGPS, setIsGettingGPS] = useState(false)
	const router = useRouter()

	const scrollRef = useRef<ScrollView>(null)
	const containerRef = useRef<View>(null)
	const [contentH, setContentH] = useState(0)

	// ✅ rota pode vir string | string[]
	const params = useLocalSearchParams()
	const inspectionId = useMemo(() => {
		const raw = params.id
		const value = Array.isArray(raw) ? raw[0] : raw
		const n = Number(value)
		return Number.isFinite(n) ? n : null
	}, [params.id])

	const [selectedInspection, setSelectedInspection] = useState<FundiaryInspectionDTO | null>(null)

	const isEdit = !!inspectionId && !!selectedInspection

	const [neighborhoods, setNeighborhoods] = useState<{ label: string; value: string }[]>([])

	const [fundiaryOccupationType, setFundiaryOccupationType] = useState<
		{ label: string; value: string }[]
	>([])
	const [fundiaryUseType, setFundiaryUseType] = useState<{ label: string; value: string }[]>([])
	const [fundiaryEnvironmentalInfluenceType, setFundiaryEnvironmentalInfluenceType] = useState<
		{ label: string; value: string }[]
	>([])

	const upper = (v?: string | null) => v?.trim().toLocaleUpperCase("pt-BR") ?? ""
	//const digits = (v?: string | null) => (v ?? "").replace(/\D/g, "")

	// Coordenadas GPS
	//const [gps, setGps] = useState<Location.LocationObject | null>(null)

	// Imagens
	const [frontLotPhoto, setFrontLotPhoto] = useState<ImageDTO[]>([])
	const [edificationPhoto, setEdificationPhoto] = useState<ImageDTO[]>([])
	const [numberPortPhoto, setNumberPortPhoto] = useState<ImageDTO[]>([])
	const [perspectivePhoto, setPerspectivePhoto] = useState<ImageDTO[]>([])
	const [complementsPhoto, setComplementsPhoto] = useState<ImageDTO[]>([])

	// Modal
	const [modal, setModal] = useState(MODAL.NONE)

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		watch,
		setFocus,
		formState: { errors },
	} = useForm<FundiaryInspectionForm>({
		defaultValues: {
			service_order_number: "",
			process_number: "",
			requester_name: "",
			requester_contact: "",
			address: "",
			neighborhood_id: "",
			address_number: "",
			lot_number: "",
			block_number: "",
			area_registration_owner: "",
			occupation_type_id: "",
			use_type_id: "",
			environmental_influence_type_id: "",
			confrontation_right: "",
			confrontation_left: "",
			confrontation_back: "",
			zone: "",
			latitude: "",
			longitude: "",
			observations: "",
		},
	})

	const latitude = watch("latitude")
	const longitude = watch("longitude")

	// ✅ Recebe os dados das imagens e salva no estado
	const saveImage = async (img: ImageDTO | ImageDTO[], modalType: MODAL) => {
		const images = Array.isArray(img) ? img : [img]

		switch (modalType) {
			case MODAL.FRONT_LOT_PHOTO:
				setFrontLotPhoto((prev) => [...prev, ...images])
				break
			case MODAL.EDIFICATION_PHOTO:
				setEdificationPhoto((prev) => [...prev, ...images])
				break
			case MODAL.NUMBER_PORT_PHOTO:
				setNumberPortPhoto((prev) => [...prev, ...images])
				break
			case MODAL.PERSPECTIVE_PHOTO:
				setPerspectivePhoto((prev) => [...prev, ...images])
				break
			case MODAL.COMPLEMENTS_PHOTO:
				setComplementsPhoto((prev) => [...prev, ...images])
				break
		}
	}

	// ✅ Busca por ID (offline)
	async function getInspectionsFundiaryById() {
		try {
			if (!inspectionId) return
			const response = await getDatabaseFundiaryInspectionById(inspectionId)
			setSelectedInspection(response)
		} catch (error) {
			Alert.alert("Atenção!", "Erro ao buscar as fiscalizações fundiárias no banco!")
		}
	}

	async function getNeighborhoods() {
		try {
			const data = await getDatabaseNeighborhood()
			const result = data.map((d: any) => ({
				label: d.name,
				value: String(d.id),
			}))
			setNeighborhoods(result)
		} catch (error) {
			console.log(error)
		}
	}

	// ✅ Quando carregar selectedInspection, preencher o form + estados
	useEffect(() => {
		if (!selectedInspection) return

		reset({
			service_order_number: selectedInspection.serviceOrderNumber ?? "",
			process_number: selectedInspection.processNumber ?? "",
			requester_name: selectedInspection.requesterName ?? "",
			requester_contact: selectedInspection.requesterContact ?? "",
			address: selectedInspection.address ?? "",
			neighborhood_id: selectedInspection.neighborhoods ?? "",
			address_number: selectedInspection.addressNumber ?? "",
			lot_number: selectedInspection.lotNumber ?? "",
			block_number: selectedInspection.blockNumber ?? "",
			area_registration_owner: selectedInspection.areaRegistrationOwner ?? "",

			occupation_type_id: selectedInspection.occupationTypeId
				? String(selectedInspection.occupationTypeId)
				: "",
			use_type_id: selectedInspection.useTypeId ? String(selectedInspection.useTypeId) : "",
			environmental_influence_type_id: selectedInspection.environmentalInfluenceTypeId
				? String(selectedInspection.environmentalInfluenceTypeId)
				: "",

			confrontation_right: selectedInspection.confrontationRight ?? "",
			confrontation_left: selectedInspection.confrontationLeft ?? "",
			confrontation_back: selectedInspection.confrontationBack ?? "",
			zone: selectedInspection.zone ?? "",
			latitude: selectedInspection.latitude ?? "",
			longitude: selectedInspection.longitude ?? "",
			observations: selectedInspection.observations ?? "",
		})

		// ⚠️ aqui assumo que no SQLite você salvou arrays de ImageDTO
		setFrontLotPhoto((selectedInspection.frontPhotos ?? []) as ImageDTO[])
		setEdificationPhoto((selectedInspection.edificationPhotos ?? []) as ImageDTO[])
		setNumberPortPhoto((selectedInspection.portPhotos ?? []) as ImageDTO[])
		setPerspectivePhoto((selectedInspection.perspectivePhotos ?? []) as ImageDTO[])
		setComplementsPhoto((selectedInspection.extraPhotos ?? []) as ImageDTO[])
	}, [selectedInspection, reset])

	// ✅ tipos (dropdown)
	async function getTableFundiaryOccupationType() {
		try {
			const data = await getDatabaseFundiaryOccupationType()
			const result = data.map((d: any) => ({
				label: d.name,
				value: String(d.id),
			}))
			setFundiaryOccupationType(result)
		} catch (error) {
			console.log(error)
		}
	}

	async function getTableFundiaryUseType() {
		try {
			const data = await getDatabaseFundiaryUseType()
			const result = data.map((d: any) => ({
				label: d.name,
				value: String(d.id),
			}))
			setFundiaryUseType(result)
		} catch (error) {
			console.log(error)
		}
	}

	// ✅ se você tiver essa tabela, descomenta e usa
	async function getTableFundiaryEnvironmentalInfluenceType() {
		try {
			const data = await getDatabaseFundiaryEnvironmentalInfluenceType()
			const result = data.map((d: any) => ({
				label: d.name,
				value: String(d.id),
			}))
			setFundiaryEnvironmentalInfluenceType(result)
		} catch (error) {
			console.log(error)
		}
	}

	// ✅ remover imagem
	const removerImagem = (modalType: MODAL, index: number) => {
		switch (modalType) {
			case MODAL.FRONT_LOT_PHOTO:
				setFrontLotPhoto((prev) => prev.filter((_, i) => i !== index))
				if (frontLotPhoto.length <= 1) setModal(MODAL.NONE)
				break
			case MODAL.EDIFICATION_PHOTO:
				setEdificationPhoto((prev) => prev.filter((_, i) => i !== index))
				if (edificationPhoto.length <= 1) setModal(MODAL.NONE)
				break
			case MODAL.NUMBER_PORT_PHOTO:
				setNumberPortPhoto((prev) => prev.filter((_, i) => i !== index))
				if (numberPortPhoto.length <= 1) setModal(MODAL.NONE)
				break
			case MODAL.PERSPECTIVE_PHOTO:
				setPerspectivePhoto((prev) => prev.filter((_, i) => i !== index))
				if (perspectivePhoto.length <= 1) setModal(MODAL.NONE)
				break
			case MODAL.COMPLEMENTS_PHOTO:
				setComplementsPhoto((prev) => prev.filter((_, i) => i !== index))
				if (complementsPhoto.length <= 1) setModal(MODAL.NONE)
				break
		}
	}

	// GPS
	async function getGPS() {
		if (isGettingGPS) return

		setIsGettingGPS(true)

		try {
			const location = await statusGPS()

			if (!location?.coords) return

			setValue("latitude", String(location.coords.latitude), {
				shouldDirty: true,
				shouldValidate: true,
			})

			setValue("longitude", String(location.coords.longitude), {
				shouldDirty: true,
				shouldValidate: true,
			})
		} catch (error) {
			console.log("Erro ao capturar GPS:", error)
			Alert.alert(
				"Não foi possível obter a localização",
				"Vá para uma área aberta, mantenha o GPS ativado e tente novamente.",
			)
		} finally {
			setIsGettingGPS(false)
		}
	}

	function buildLocalPayload(form: FormData, data: FundiaryInspectionForm) {
		return {
			serviceOrderNumber: data.service_order_number,
			processNumber: data.process_number,
			processYear: data.process_year,

			requesterName: upper(data.requester_name),
			requesterContact: data.requester_contact,

			address: upper(data.address),
			neighborhoods: data.neighborhood_id,
			addressNumber: data.address_number,
			lotNumber: data.lot_number,
			blockNumber: data.block_number,

			areaRegistrationOwner: data.area_registration_owner.trim(),
			observations: data.observations ? data.observations.trim() : "Sem observações",

			occupationTypeId: Number(data.occupation_type_id),
			useTypeId: Number(data.use_type_id),
			environmentalInfluenceTypeId: Number(data.environmental_influence_type_id),

			frontPhotos: frontLotPhoto,
			edificationPhotos: edificationPhoto,
			portPhotos: numberPortPhoto,
			perspectivePhotos: perspectivePhoto,
			extraPhotos: complementsPhoto,

			latitude: data.latitude ?? "",
			longitude: data.longitude ?? "",

			date: (form.get("inspection_date") as string) ?? "",
			time: (form.get("inspection_time") as string) ?? "",

			confrontationRight: data.confrontation_right,
			confrontationLeft: data.confrontation_left,
			confrontationBack: data.confrontation_back,
			zone: data.zone,
		}
	}

	function appendPhotos(form: FormData, fieldName: string, photos: ImageDTO[]) {
		if (!photos.length) return

		photos.forEach((photo, index) => {
			form.append(fieldName, {
				...photo,
				uri: photo.uri,
			} as any)
		})
	}

	// Enviar (online / offline)
	async function handleSubmitForm(data: FundiaryInspectionForm) {
		setIsLoaded(true)

		const form = new FormData()

		const currentdate = new Date()
		const date =
			currentdate.getFullYear() +
			"-" +
			String(currentdate.getMonth() + 1).padStart(2, "0") +
			"-" +
			String(currentdate.getDate()).padStart(2, "0")

		const time =
			String(currentdate.getHours()).padStart(2, "0") +
			":" +
			String(currentdate.getMinutes()).padStart(2, "0") +
			":" +
			String(currentdate.getSeconds()).padStart(2, "0")

		// ✅ normaliza antes de enviar
		const normalized: FundiaryInspectionForm = {
			...data,
			requester_name: upper(data.requester_name),
			address: upper(data.address),

			// se você quiser salvar só números no backend:
			requester_contact: data.requester_contact,

			// trim simples nos demais
			service_order_number: data.service_order_number?.split("/")[0].trim() ?? "",
			service_order_year: data.service_order_number?.split("/")[1]?.trim() ?? "",
			process_number: data.process_number?.split("/")[0].trim() ?? "",
			process_year: data.process_number?.split("/")[1]?.trim() ?? "",
			address_number: data.address_number?.trim() ?? "",
			neighborhood_id: data.neighborhood_id?.trim() ?? "",
			lot_number: data.lot_number?.trim() ?? "",
			block_number: data.block_number?.trim() ?? "",
			confrontation_right: data.confrontation_right?.trim() ?? "",
			confrontation_left: data.confrontation_left?.trim() ?? "",
			confrontation_back: data.confrontation_back?.trim() ?? "",
			area_registration_owner: data.area_registration_owner?.trim() ?? "",
			latitude: data.latitude ?? "",
			longitude: data.longitude ?? "",

			zone: data.zone,
			occupation_type_id: data.occupation_type_id ?? "",
			use_type_id: data.use_type_id ?? "",
			environmental_influence_type_id: data.environmental_influence_type_id ?? "",
			observations: data.observations?.trim() || "Sem observações",
		}

		// ✅ campos do formulário (agora normalizados)
		Object.entries(normalized).forEach(([key, value]) => {
			form.append(key, value ?? "")
		})

		// ✅ imagens
		appendPhotos(form, "front_photos[]", frontLotPhoto)
		appendPhotos(form, "port_photos[]", numberPortPhoto)
		appendPhotos(form, "edification_photos[]", edificationPhoto)
		appendPhotos(form, "perspective_photos[]", perspectivePhoto)
		appendPhotos(form, "extra_photos[]", complementsPhoto)

		// ✅ datas
		form.append("auto_number", "")
		form.append("inspection_date", date)
		form.append("inspection_time", time)

		//console.log("Checklist salvo", JSON.stringify(form, null, 2))

		try {
			const response = await server.postForm("/fundiary-inspections", form)

			//console.log("SUCESSO FUNDIÁRIA:", response.data)
			// ✅ mantém o SQLite sincronizado com o que foi enviado
			if (inspectionId) {
				await delDatabaseFundiaryInspection(inspectionId)
			}

			Toast.show({ type: "success", text1: "Formulário enviado com sucesso!" })
			router.back()
		} catch (error: any) {
			// console.log("⚠️ Falha no envio, salvando offline:", error?.message)
			// console.log("ERRO ENVIO FUNDIÁRIA -> message:", error?.message)
			// console.log("ERRO ENVIO FUNDIÁRIA -> status:", error?.response?.status)
			// console.log("ERRO ENVIO FUNDIÁRIA -> data:", error?.response?.data)
			// console.log("ERRO ENVIO FUNDIÁRIA -> request:", error?.request)
			await handleSubmitFormOffline(form, data)
		} finally {
			setIsLoaded(false)
		}
	}

	async function handleSubmitFormOffline(form: FormData, data: FundiaryInspectionForm) {
		try {
			const payload = buildLocalPayload(form, data)

			if (inspectionId) {
				const ok = await updateDatabaseFundiaryInspection(inspectionId, payload)
				if (!ok) throw new Error("Falha ao atualizar no banco local")
				Toast.show({ type: "success", text1: "Dados atualizados offline!" })
				router.back()
				return
			}

			await addDatabaseFundiaryInspection([payload])
			Toast.show({ type: "success", text1: "Dados salvos offline!" })
			router.back()
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Algo deu errado!",
				text2: "Não foi possível salvar!",
			})
			//console.log(error)
		}
	}

	// Permissões GPS
	async function getPermissionGPS(): Promise<boolean> {
		const { status } = await Location.requestForegroundPermissionsAsync()

		if (status !== "granted") {
			Alert.alert("Permissão negada", "Dê permissão da localização para continuar.")
			return false
		}

		return true
	}

	async function statusGPS(): Promise<Location.LocationObject | null> {
		const hasPermission = await getPermissionGPS()
		if (!hasPermission) return null

		const isGPSEnabled = await Location.hasServicesEnabledAsync()

		if (!isGPSEnabled) {
			Alert.alert("GPS desativado", "Ative o GPS para capturar a localização.")
			return null
		}

		try {
			return await Promise.race([
				Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.High,
				}),
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error("Tempo limite do GPS excedido")), 30000),
				),
			])
		} catch (error) {
			// Sem internet, uma primeira leitura do GPS pode demorar. Nesse caso,
			// aproveita somente uma posição recente e com precisão aceitável.
			const lastKnown = await Location.getLastKnownPositionAsync({
				maxAge: 5 * 60 * 1000,
				requiredAccuracy: 100,
			})

			if (lastKnown) return lastKnown
			throw error
		}
	}

	const handlePrintAndShare = useCallback(async () => {
		Keyboard.dismiss()

		await new Promise<void>((resolve) =>
			InteractionManager.runAfterInteractions(() => resolve()),
		)
		await new Promise((r) => setTimeout(r, 350))

		const uri = await captureRef(containerRef, {
			format: "png",
			quality: 1,
			result: "tmpfile",
		})

		await Sharing.shareAsync(uri)
	}, [])

	useEffect(() => {
		getTableFundiaryOccupationType()
		getTableFundiaryUseType()
		getTableFundiaryEnvironmentalInfluenceType()
		getInspectionsFundiaryById()
		getNeighborhoods()
	}, [])

	return (
		<>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					ref={scrollRef}
					onContentSizeChange={(_, h) => setContentH(h)}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
				>
					<View
						ref={containerRef}
						collapsable={false}
						style={{ minHeight: contentH, backgroundColor: "#fff" }}
					>
						<HeaderBack title="Formulário Fundiário" variant="primary" />

						<View className="flex p-4">
							<View className="flex-row justify-between gap-4 mb-4">
								{/* Número da ordem de serviço */}
								<View className="flex-1">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										Nº de Serviço:
									</Text>

									<Controller
										control={control}
										name="service_order_number"
										rules={{
											required: "Campo obrigatório!",
											pattern: {
												value: /^\d+\/\d{4}$/,
												message: "Inválido. ex: 123/2026",
											},
										}}
										render={({
											field: { onChange, value, ref },
											fieldState: { error },
										}) => (
											<Field
												ref={ref}
												placeholder="Nº de Serviço"
												variant="primary"
												value={value}
												returnKeyType="next"
												keyboardType="numeric"
												submitBehavior="submit"
												onSubmitEditing={() => setFocus("process_number")}
												onChangeText={(text) => {
													onChange(maskProcess(text))
												}}
												errorMessage={error?.message}
											/>
										)}
									/>
								</View>

								{/* Número do processo */}
								<View className="flex-1">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										Nº do Processo:
									</Text>
									<Controller
										control={control}
										name="process_number"
										rules={{
											required: "Campo obrigatório!",
											pattern: {
												value: /^\d+\/\d{4}$/,
												message: "Inválido. ex: 123/2026",
											},
										}}
										render={({
											field: { onChange, value, ref },
											fieldState: { error },
										}) => (
											<Field
												ref={ref}
												placeholder="Nº do Processo"
												variant="primary"
												returnKeyType="next"
												keyboardType="numeric"
												submitBehavior="submit"
												onSubmitEditing={() => setFocus("requester_name")}
												onChangeText={(text) => {
													onChange(maskProcess(text))
												}}
												value={value}
												errorMessage={error?.message}
											/>
										)}
									/>
								</View>
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
									render={({
										field: { onChange, value, ref },
										fieldState: { error },
									}) => (
										<Field
											ref={ref}
											placeholder="Nome do Requerente"
											variant="primary"
											returnKeyType="next"
											submitBehavior="submit"
											onSubmitEditing={() => setFocus("requester_contact")}
											onChangeText={onChange}
											value={value}
											errorMessage={error?.message}
										/>
									)}
								/>
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
											if (!v || !v.trim()) return true
											return v.trim().length >= 0 || "Contato muito curto!"
										},
										// required: "Informe o contato!",
									}}
									render={({
										field: { onChange, value, ref },
										fieldState: { error },
									}) => (
										<Field
											ref={ref}
											placeholder="Contato do Requerente"
											variant="primary"
											returnKeyType="next"
											submitBehavior="submit"
											onSubmitEditing={() => setFocus("address")}
											keyboardType="phone-pad"
											onChangeText={(text) => {
												onChange(maskPhone(text))
											}}
											value={value}
											errorMessage={error?.message}
										/>
									)}
								/>
							</View>

							{/* Endereço */}
							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Endereço:
								</Text>
								<Controller
									control={control}
									name="address"
									// rules={{ required: "Informe o endereço" }}
									render={({
										field: { onChange, value, ref },
										fieldState: { error },
									}) => (
										<Field
											ref={ref}
											placeholder="Endereço completo"
											variant="primary"
											returnKeyType="next"
											submitBehavior="submit"
											onSubmitEditing={() => setFocus("neighborhood_id")}
											onChangeText={onChange}
											value={value}
											errorMessage={error?.message}
										/>
									)}
								/>
							</View>

							{/* Bairro */}
							<View className="mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Selecione o Bairro:
								</Text>
								<Controller
									control={control}
									name="neighborhood_id"
									// rules={{ required: "Selecione o Bairro!" }}
									render={({
										field: { onChange, value, ref },
										fieldState: { error },
									}) => (
										<RNDropdownButton
											ref={ref}
											data={neighborhoods}
											placeholder="Bairro"
											value={value}
											searchable
											errorMessage={error?.message}
											onSelect={(selected) => {
												if (Array.isArray(selected)) return
												onChange(selected)
												setFocus("address_number")
											}}
										/>
									)}
								/>
							</View>

							{/* Número do Imóvel */}
							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Nº de Porta:
								</Text>
								<Controller
									control={control}
									name="address_number"
									render={({ field: { onChange, value, ref } }) => (
										<Field
											ref={ref}
											placeholder="Número do Endereço"
											variant="primary"
											keyboardType="numeric"
											submitBehavior="submit"
											returnKeyType="next"
											onSubmitEditing={() => setFocus("lot_number")}
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
							</View>

							{/* Lote, Quadra e Zona */}
							<View className="flex mb-4">
								<View className="flex-row justify-between gap-4">
									<View className="flex-1">
										<Text className="text-gray-500 font-regular text-2xl font-bold">
											Lote:
										</Text>
										<Controller
											control={control}
											name="lot_number"
											// rules={{ required: "Obrigatório!" }}
											render={({
												field: { onChange, value, ref },
												fieldState: { error },
											}) => (
												<Field
													ref={ref}
													placeholder="Nº Lote"
													variant="primary"
													keyboardType="numeric"
													submitBehavior="submit"
													returnKeyType="next"
													onSubmitEditing={() => setFocus("block_number")}
													onChangeText={onChange}
													value={value}
													errorMessage={error?.message}
												/>
											)}
										/>
									</View>

									<View className="flex-1">
										<Text className="text-gray-500 font-regular text-2xl font-bold">
											Quadra:
										</Text>
										<Controller
											control={control}
											name="block_number"
											// rules={{ required: "Obrigatório!" }}
											render={({
												field: { onChange, value, ref },
												fieldState: { error },
											}) => (
												<Field
													ref={ref}
													placeholder="Nº"
													variant="primary"
													keyboardType="numeric"
													submitBehavior="submit"
													returnKeyType="next"
													onSubmitEditing={() => setFocus("zone")}
													onChangeText={onChange}
													value={value}
													errorMessage={error?.message}
												/>
											)}
										/>
									</View>

									<View className="flex-1">
										<Text className="text-gray-500 font-regular text-2xl font-bold">
											Zona:
										</Text>
										<Controller
											control={control}
											name="zone"
											// rules={{ required: "Obrigatório!" }}
											render={({
												field: { onChange, value, ref },
												fieldState: { error },
											}) => (
												<Field
													ref={ref}
													placeholder="Zona"
													variant="primary"
													keyboardType="numeric"
													submitBehavior="submit"
													returnKeyType="next"
													onSubmitEditing={() =>
														setFocus("confrontation_right")
													}
													onChangeText={onChange}
													value={value}
													errorMessage={error?.message}
												/>
											)}
										/>
									</View>
								</View>
							</View>

							{/* Confrontações: direito, esquerdo e fundos */}
							<View className="flex mb-4">
								<View className="mb-4 items-center justify-center">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										Confrontações!
									</Text>
								</View>
								<View className="flex-row justify-between gap-4">
									<View className="flex-1">
										<Text className="text-gray-500 font-regular text-2xl font-bold">
											Direito:
										</Text>
										<Controller
											control={control}
											name="confrontation_right"
											render={({ field: { onChange, value, ref } }) => (
												<Field
													ref={ref}
													placeholder="Direito"
													variant="primary"
													keyboardType="numeric"
													submitBehavior="submit"
													returnKeyType="next"
													onSubmitEditing={() =>
														setFocus("confrontation_left")
													}
													onChangeText={onChange}
													value={value}
												/>
											)}
										/>
									</View>

									<View className="flex-1">
										<Text className="text-gray-500 font-regular text-2xl font-bold">
											Esq.:
										</Text>
										<Controller
											control={control}
											name="confrontation_left"
											render={({ field: { onChange, value, ref } }) => (
												<Field
													ref={ref}
													placeholder="Esquerdo"
													variant="primary"
													keyboardType="numeric"
													submitBehavior="submit"
													returnKeyType="next"
													onSubmitEditing={() =>
														setFocus("confrontation_back")
													}
													onChangeText={onChange}
													value={value}
												/>
											)}
										/>
									</View>

									<View className="flex-1">
										<Text className="text-gray-500 font-regular text-2xl font-bold">
											Fundos:
										</Text>
										<Controller
											control={control}
											name="confrontation_back"
											render={({ field: { onChange, value, ref } }) => (
												<Field
													ref={ref}
													placeholder="Fundo"
													variant="primary"
													keyboardType="numeric"
													submitBehavior="submit"
													returnKeyType="next"
													onSubmitEditing={() =>
														setFocus("area_registration_owner")
													}
													onChangeText={onChange}
													value={value}
												/>
											)}
										/>
									</View>
								</View>
							</View>

							<Controller
								control={control}
								name="latitude"
								// rules={{ required: "Marque a posição GPS" }}
								render={() => null}
							/>

							<Controller
								control={control}
								name="longitude"
								// rules={{ required: "Marque a posição GPS" }}
								render={() => null}
							/>

							<Pressable
								className="mb-4 w-full items-center justify-center p-4 rounded-md bg-blue-500 active:opacity-60"
								disabled={isGettingGPS}
								onPress={() => {
									getGPS()
									Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
								}}
							>
								<Button.TextButton
									title={
										isGettingGPS
											? "Obtendo GPS..."
											: latitude
												? "Atualizar Posição"
												: "Marcar Posição"
									}
								/>
							</Pressable>

							{errors.latitude && (
								<Text className="text-red-500 mb-4">{errors.latitude.message}</Text>
							)}

							{latitude && longitude && (
								<View className="flex items-center mb-4">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										GPS: {latitude}, {longitude}
									</Text>
								</View>
							)}

							<View className="flex mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Matricula da Área/Proprietário:
								</Text>
								<Controller
									control={control}
									name="area_registration_owner"
									render={({ field: { onChange, value, ref } }) => (
										<Field
											ref={ref}
											placeholder="Matrícula da Área/Proprietário"
											variant="primary"
											submitBehavior="submit"
											returnKeyType="next"
											onSubmitEditing={() => setFocus("occupation_type_id")}
											onChangeText={onChange}
											value={value}
										/>
									)}
								/>
							</View>

							{/* Tipo de ocupação */}
							<View className="mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Tipo de Ocupação:
								</Text>
								<Controller
									control={control}
									name="occupation_type_id"
									// rules={{ required: "Selecione o tipo de ocupação!" }}
									render={({
										field: { onChange, value, ref },
										fieldState: { error },
									}) => (
										<DropdownButton
											ref={ref}
											data={fundiaryOccupationType}
											placeholder="Ocupação"
											value={value}
											errorMessage={error?.message}
											onSelect={(item) => {
												;(onChange(item.value), setFocus("use_type_id"))
											}}
										/>
									)}
								/>
							</View>

							{/* Tipo de uso */}
							<View className="mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Tipo de Uso:
								</Text>
								<Controller
									control={control}
									name="use_type_id"
									// rules={{ required: "Selecione o tipo de uso!" }}
									render={({
										field: { onChange, value, ref },
										fieldState: { error },
									}) => (
										<DropdownButton
											ref={ref}
											data={fundiaryUseType}
											placeholder="Tipo de Uso"
											value={value}
											errorMessage={error?.message}
											onSelect={(item) => {
												;(onChange(item.value),
													setFocus("environmental_influence_type_id"))
											}}
										/>
									)}
								/>
							</View>

							{/* Tipo de influência ambiental */}
							<View className="mb-4">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Tipo de Influência Ambiental:
								</Text>
								<Controller
									control={control}
									name="environmental_influence_type_id"
									rules={
										{
											// required: "Selecione o tipo de influência ambiental!",
										}
									}
									render={({
										field: { onChange, value, ref },
										fieldState: { error },
									}) => (
										<DropdownButton
											ref={ref}
											data={fundiaryEnvironmentalInfluenceType}
											placeholder="Tipo de Influência Ambiental"
											value={value}
											errorMessage={error?.message}
											onSelect={(item) => {
												onChange(item.value)
												setFocus("observations")
											}}
										/>
									)}
								/>
							</View>

							<View className="flex mb-5">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Observação:
								</Text>

								<Controller
									control={control}
									name="observations"
									render={({ field: { onChange, value, ref } }) => (
										<Field
											ref={ref}
											placeholder="Descreva o assunto."
											variant="primary"
											submitBehavior="submit"
											returnKeyType="none"
											onChangeText={onChange}
											value={value}
											multiline
										/>
									)}
								/>
							</View>

							{/* Imagens */}
							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Frente do Lote:
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.FRONT_LOT_PHOTO)
											}
										/>
									</View>
									<View className="flex-1 ml-2">
										<GalleryPick
											multiple={true}
											onChange={(img) =>
												saveImage(img, MODAL.FRONT_LOT_PHOTO)
											}
										/>
									</View>
								</View>

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
								) : null}
							</View>

							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Foto do Nº de Porta:
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.NUMBER_PORT_PHOTO)
											}
										/>
									</View>
									<View className="flex-1 ml-2">
										<GalleryPick
											multiple={true}
											onChange={(img) =>
												saveImage(img, MODAL.NUMBER_PORT_PHOTO)
											}
										/>
									</View>
								</View>

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
								) : null}
							</View>

							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Edificação:
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.EDIFICATION_PHOTO)
											}
										/>
									</View>
									<View className="flex-1 ml-2">
										<GalleryPick
											multiple={true}
											onChange={(img) =>
												saveImage(img, MODAL.EDIFICATION_PHOTO)
											}
										/>
									</View>
								</View>

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
								) : null}
							</View>

							<View className="flex">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Perspectiva:
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.PERSPECTIVE_PHOTO)
											}
										/>
									</View>
									<View className="flex-1 ml-2">
										<GalleryPick
											multiple={true}
											onChange={(img) =>
												saveImage(img, MODAL.PERSPECTIVE_PHOTO)
											}
										/>
									</View>
								</View>

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
								) : null}
							</View>

							<View className="flex mb-5">
								<Text className="text-gray-500 font-regular text-2xl font-bold">
									Foto Complementar:
								</Text>
								<View className="flex flex-row justify-between my-4">
									<View className="flex-1 mr-2">
										<CameraSave
											onChange={(img) =>
												saveImage(img, MODAL.COMPLEMENTS_PHOTO)
											}
										/>
									</View>
									<View className="flex-1 ml-2">
										<GalleryPick
											multiple={true}
											onChange={(img) =>
												saveImage(img, MODAL.COMPLEMENTS_PHOTO)
											}
										/>
									</View>
								</View>

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
								) : null}
							</View>

							{/* <Button variant="primary" onPress={handlePrintAndShare}>
								<Button.TextButton title="ENVIAR" />
							</Button> */}
							<Button variant="primary" onPress={handleSubmit(handleSubmitForm)}>
								<Button.TextButton title="ENVIAR" />
							</Button>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			<Modal
				className="bg-gray-200"
				variant="primary"
				visible={
					modal === MODAL.FRONT_LOT_PHOTO ||
					modal === MODAL.EDIFICATION_PHOTO ||
					modal === MODAL.NUMBER_PORT_PHOTO ||
					modal === MODAL.PERSPECTIVE_PHOTO ||
					modal === MODAL.COMPLEMENTS_PHOTO
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
										: modal === MODAL.PERSPECTIVE_PHOTO
											? perspectivePhoto
											: modal === MODAL.COMPLEMENTS_PHOTO
												? complementsPhoto
												: []
						}
						keyExtractor={(_, index) => index.toString()}
						renderItem={({ item, index }) => (
							<View className="w-full mb-4 bg-white p-2 rounded-md border-gray-300 border-2">
								<Image
									className="h-80 rounded-md"
									source={{ uri: item.uri }}
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
