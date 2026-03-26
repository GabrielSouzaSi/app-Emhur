import * as Location from "expo-location"
import { useRouter } from "expo-router"
import * as ScreenOrientation from "expo-screen-orientation"
import { useCallback, useEffect, useRef, useState } from "react"
import {
	Alert,
	Dimensions,
	FlatList,
	Image,
	Keyboard,
	Pressable,
	Modal as RNModal,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native"
import SignatureCanvas from "react-native-signature-canvas"

import debounce from "lodash.debounce"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/button"
import { DropdownButton } from "@/components/buttonDropdown"
import { CameraSave } from "@/components/CameraSave"
import { GalleryPick } from "@/components/GalleryPick"
import { HeaderBack } from "@/components/headerBack"
import { Holder } from "@/components/Holder"
import { Field } from "@/components/input"
import { Loading } from "@/components/loading"
import { Modal } from "@/components/modal"
import { getDatabaseApproach } from "@/database/approach"
import { addDatabaseViolation } from "@/database/violation"
import { getDatabaseViolationCode } from "@/database/violationsCode"
import { ImageDTO } from "@/dtos/imageDTO"
import { PermitHolderDTO } from "@/dtos/permitHolderDTO"
import { VehicleDTO } from "@/dtos/vehicleDTO"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"
import { MaterialCommunityIcons } from "@expo/vector-icons"

import { Search } from "@/components/search"
import { getDatabaseDriverType } from "@/database/driverTypes"
import { getDatabasePermitType } from "@/database/permitType"
import { saveSignatureAsPng } from "@/utils/file"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import Toast from "react-native-toast-message"
import colors from "tailwindcss/colors"

enum MODAL {
	NONE = 0,
	IMAGENS = 1,
	INFRACAO = 2,
	QR = 3,
	QRCODE = 4,
	SIGNATURE = 5,
}
type ListCod = {
	id: number
	description: string
}

type FormData = {
	numero: string
	permitType: string
	driverType: string
	abordagem: number
	local: string
	infracoes: number[]
}

export type ViolationCode = {
	id: number
	code: string
	description: string
	permitTypeId: number
}

export default function Autuacaoes() {
	const ref = useRef<any>(null)
	const { width, height } = Dimensions.get("window")

	// informação do usuário
	const { user } = useAuth()

	const [isLoaded, setIsLoaded] = useState(false)

	const [codeQr, setCodeQr] = useState("")

	const router = useRouter()

	// Mode de Abordagem
	const [approach, setApproach] = useState<any>([])
	const [abordagem, setAbordagem] = useState<number>()

	// Tipo de Condutor
	const [driverType, setDriverType] = useState<any>([])

	const qrCodeLock = useRef(false)

	// Informações do Veiculo
	const [vehicle, setVehicle] = useState<VehicleDTO>()
	const [permitType, setPermitType] = useState<string>("")
	const [permitTypeOption, setPermitTypeOption] = useState<any>([])
	const [imagens, setImagens] = useState<ImageDTO[]>([])

	// Condutor
	const [condutor, setCondutor] = useState<any>(false)

	const [driverTypeId, setDriverTypeId] = useState<any>("")

	// Assistent
	const [assistenteId, setAssistenteId] = useState<number>()
	const [driverName, setDriverName] = useState<string>("")
	const [driverCpf, setDriverCpf] = useState<string>("")
	const [driverCnh, setDriverCnh] = useState<string>("")
	const [refused, setRefused] = useState<boolean>(false)

	// Dados da Infração
	const [idInfracao, setIdInfracao] = useState<number[]>([])
	const [textCod, setTextCod] = useState<string[]>([])
	const [obs, setObs] = useState("")

	// Dados do Condutor/Infrator
	const [permitHolder, setPermitHolder] = useState<PermitHolderDTO>()

	// Modal
	const [modal, setModal] = useState(MODAL.NONE)

	// Recebe a lista de códigos
	const [codigo, setCodigo] = useState<ListCod[]>([])
	const [selecText, setSelecText] = useState<ListCod[]>([])

	// Assinatura
	const [signatureUri, setSignatureUri] = useState<string>("")
	const [signaturePngUri, setSignaturePngUri] = useState<string>("")

	const {
		control,
		handleSubmit,
		formState: { errors },
		setValue,
		clearErrors,
	} = useForm<FormData>()

	// Busca as informações do veículo
	async function searchPlate(req: any) {
		Keyboard.dismiss()
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/vehicle/${req}`)
			const { permit_holder_id, vehicle_id } = data
			setVehicle(vehicle_id)
			setPermitHolder(permit_holder_id)
			setPermitType(data.permit_type.id.toString())
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Veículo não encontrado!",
			})
		} finally {
			setIsLoaded(false)
		}
	}
	// Busca as informações do Condutor
	async function searchAssistentCPF(req: any) {
		Keyboard.dismiss()
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/assistant/${req}`)
			setAssistenteId(data.id)
			setDriverCpf(data.cpf)
			setDriverCnh(data.cnh)
			setDriverName(data.name)
			Alert.alert("Sucesso", "Assistente encontrado!")
		} catch (error) {
			if (error.response) {
				console.log("Erro da API:", error.response.data)
				Alert.alert("Aviso", error.response.data.erro || "Erro desconhecido!")
			} else {
				console.log("Erro desconhecido:", error.message)
				Alert.alert("Erro", "Não foi possível encontrar o condutor.")
			}
		} finally {
			setIsLoaded(false)
		}
	}
	// Função para trazer os dados da tabela infracoes
	async function getViolationCode(permitTypeId: number) {
		try {
			const response = await getDatabaseViolationCode()

			const filtered = response.filter(
				(item: ViolationCode) => item.permitTypeId === permitTypeId,
			)

			let cod = await filtered.map((item: any) => {
				return {
					id: item.id,
					description: `${item.code}: ${item.description}`,
				}
			})
			setCodigo(cod)
			setSelecText(cod)
		} catch (error) {
			console.log("fetchInfracoes =>" + error)
		} finally {
			setIsLoaded(false)
		}
	}
	// Função para trazer os dados do tipo de condutor
	async function getDriverType() {
		try {
			const response = await getDatabaseDriverType()
			// console.log(response);

			let result = response.map((item: any) => {
				return {
					value: `${item.id}`,
					label: `${item.name}`,
				}
			})

			setDriverType(result)
		} catch (error) {
			console.log("getViolationCode error =>" + error)
		}
	}
	// Função para trazer os dados da tabela approach
	async function getApproach() {
		try {
			const response = await getDatabaseApproach()

			let optionApproach = response.map((data: any) => {
				return {
					label: data.name,
					value: data.id,
				}
			})

			setApproach(optionApproach)
		} catch (error) {
			console.log("getApproach error =>" + error)
		}
	}
	// Função para trazer os dados da tabela permitType
	async function getPermitType() {
		try {
			const response = await getDatabasePermitType()

			let optionPermitType = response.map((data: any) => {
				return {
					label: data.name,
					value: `${data.id}`,
				}
			})

			setPermitTypeOption(optionPermitType)
		} catch (error) {
			console.log("getApproach error =>" + error)
		}
	}
	// Criar a autuacao
	async function postViolation(data: FormData) {
		setIsLoaded(true)
		let status = await statusGPS()
		if (status) {
			let loc: Location.LocationObject = status
			let currentdate = new Date()
			let date =
				+currentdate.getFullYear() +
				"-" +
				(currentdate.getMonth() + 1) +
				"-" +
				currentdate.getDate()

			let time =
				currentdate.getHours() +
				":" +
				currentdate.getMinutes() +
				":" +
				currentdate.getSeconds()

			const formData = new FormData()
			formData.append("permit_holder_id", `${permitHolder?.id}`)
			formData.append("user_id", `${user.id}`)
			formData.append("vehicle_id", `${vehicle?.id}`)
			formData.append("approach_id", `${abordagem}`)
			idInfracao.forEach((id) => {
				formData.append("violation_code_id[]", id.toString())
			})
			formData.append("violation_date", date)
			formData.append("violation_time", time)
			formData.append("latitude", `${loc.coords.latitude}`)
			formData.append("longitude", `${loc.coords.longitude}`)
			formData.append("driver_type_id", `${driverTypeId}`)
			formData.append(
				"driver_name",
				`${driverName === "" ? "Nome Não Informado" : driverName}`,
			)
			formData.append("driver_cpf", `${driverCpf === "" ? "CPF Não Informado" : driverCpf}`)
			formData.append("driver_cnh", `${driverCnh === "" ? "CNH Não Informado" : driverCnh}`)
			formData.append("signature_base64", signatureUri)
			formData.append("address", data.local)
			formData.append(
				"description",
				`${refused ? "O condutor se recusou a assinar o auto de infração. " : ""}${
					obs || refused ? obs : "Sem observações"
				}`,
			)
			imagens.forEach((image: ImageDTO) => {
				formData.append("attachments[]", {
					...image,
					uri: image.uri,
					name: image.name,
					type: image.type,
				} as any)
			})
			formData.append("appeal_end_date", date)

			// console.log("formData => ", formData);
			// let d = formData.getAll("violation_code_id[]");
			// console.log(JSON.parse(JSON.stringify(d)));

			//console.log("Checklist salvo", JSON.stringify(formData, null, 2));

			try {
				// 1️⃣ Tenta enviar ao servidor
				await server.postForm(`/violations`, formData)
				Toast.show({
					type: "success",
					text1: "Autuação enviado com sucesso!",
				})
				router.back()
			} catch (error: any) {
				// 2️⃣ Se houver falha de rede ou servidor → salva offline
				console.log("⚠️ Falha no envio, salvando offline:", error?.message)
				await addViolation(data)
			} finally {
				setIsLoaded(false)
			}
		} else {
			setIsLoaded(false)
		}
	}
	// Cadastra a autuação no banco
	async function addViolation(form: FormData) {
		try {
			let loc = await statusGPS()
			if (!loc) return

			const currentdate = new Date()
			const date = `${currentdate.getFullYear()}-${
				currentdate.getMonth() + 1
			}-${currentdate.getDate()}`
			const time = `${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`

			const data = [
				{
					vehicle: form.numero, // placa ou numero
					imagens: imagens,
					local: form.local,
					driverTypeId,
					driverName: `${driverName === "" ? "Nome Não Informado" : driverName}`,
					driverCpf: `${driverCpf === "" ? "CPF Não Informado" : driverCpf}`,
					driverCnh: `${driverCnh === "" ? "CNH Não Informado" : driverCnh}`,
					signatureUri,
					latitude: `${loc.coords.latitude}`,
					longitude: `${loc.coords.longitude}`,
					data: date,
					hora: time,
					approach: `${abordagem}`,
					idInfracao: idInfracao,
					obs: `${
						refused ? "O condutor se recusou a assinar o auto de infração.\n" : ""
					}${obs || refused ? obs : "Sem observações"}`,
					status: "Pendente",
				},
			]

			await addDatabaseViolation(data)
			Toast.show({
				type: "success",
				text1: "Autuação salvo offline!",
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

	// filtra o cógigo conforme a pesquisa do usuário
	const filter = useCallback(
		debounce((text: string) => {
			if (!text) {
				setSelecText(codigo) // valor original
				return
			}

			const lower = text.toLowerCase()

			const filtered = codigo.filter((item: ListCod) =>
				item.description.toLowerCase().includes(lower),
			)

			if (filtered.length === 0) {
				setSelecText([{ id: 1000, description: "Sem resultados!" }] as any)
				return
			}

			setSelecText(filtered)
		}, 250),
		[codigo],
	)

	// Função para pegar o tipo de alvará selecionado
	const onSelectPermitType = (item: string) => {
		getViolationCode(Number(item))
	}
	// Função para preparar o componente RadioButton
	const onSelectMode = (item: any) => {
		console.log(permitHolder)

		setAbordagem(item.value)
		setDriverTypeId("1")
		if (item.value === 2) {
			setDriverName(permitHolder ? permitHolder.name : "")
			setDriverCpf(permitHolder ? permitHolder.cpf : "")
			setDriverCnh(permitHolder ? permitHolder.cnh : "")
		}
	}
	// Função para pegar o tipo de condutor selecionado
	const onSelectDriverType = (item: any) => {
		setDriverTypeId(item)
		console.log(permitHolder)

		if (item === "1") {
			setDriverName(permitHolder ? permitHolder.name : "")
			setDriverCpf(permitHolder ? permitHolder.cpf : "")
			setDriverCnh(permitHolder ? permitHolder.cnh : "")
		}
	}

	{
		/* renderItem otimizado */
	}
	const renderItem = useCallback(
		({ item }) => {
			const isSelected = idInfracao.includes(item.id)

			return (
				<TouchableOpacity
					className={`rounded-md p-2 my-3 ${isSelected ? "bg-blue-500" : "bg-gray-300"}`}
					onPress={() => onSelectData(item)}
				>
					<Text
						className={`text-lg font-medium ${
							isSelected ? "text-white" : "text-black"
						}`}
					>
						{item.description}
					</Text>
				</TouchableOpacity>
			)
		},
		[idInfracao], // só re-render se mudar a seleção
	)

	// Função recebe o código da infração selecionada
	// Função para marcar/desmarcar seleção
	function onSelectData(item: ListCod) {
		clearErrors("infracoes")

		// 👉 Se o item já está selecionado, desmarca tudo
		if (idInfracao.includes(item.id)) {
			setIdInfracao([])
			setTextCod([])
			setValue("infracoes", [], { shouldValidate: true })
			return
		}

		// 👉 Caso contrário, seleciona APENAS ele
		setIdInfracao([item.id])
		setTextCod([item.description])

		// ✅ Atualiza o formulário com o valor novo
		setValue("infracoes", [item.id], { shouldValidate: true })
	}
	// Recebe os dados da imagem e salva no array
	const saveImage = async (img: ImageDTO) => {
		setImagens((prev) => [...prev, img])
	}

	// Função para remover imagem
	const removerImagem = (index: number) => {
		setImagens((prev) => {
			const updated = prev.filter((_, i) => i !== index)
			if (updated.length < 1) setModal(MODAL.NONE)
			return updated
		})
	}

	// Função chamada quando a assinatura é concluída
	const handleSignature = async (signature: string) => {
		//console.log("Base64 da assinatura:", signature);
		setModal(MODAL.NONE)
		setSignatureUri(signature)
		const signaturepng = await saveSignatureAsPng(signature)
		setSignaturePngUri(signaturepng)
	}

	// Função para limpar a assinatura
	const handleClear = () => {
		ref.current?.clearSignature()
		if (signatureUri) {
			setModal(MODAL.NONE)
			setSignatureUri("")
			setTimeout(() => {
				setModal(MODAL.SIGNATURE)
			}, 1200)
		}
	}
	// Função para salvar a assinatura
	const handleSave = () => ref.current?.readSignature()

	useEffect(() => {
		getApproach()
		getPermitType()
		getDriverType()
	}, [])

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
	async function statusGPS() {
		const isGPSEnabled = await Location.hasServicesEnabledAsync()

		if (!isGPSEnabled) {
			Alert.alert("GPS desativado", "Ative o GPS para capturar a localização.")
			return false
		} else {
			// Capturar localização
			const userLocation = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			})
			// Armazena a localização no estado
			return userLocation
		}
	}

	useEffect(() => {
		getPermissionGPS()
	}, [])

	useEffect(() => {
		if (permitType) {
			onSelectPermitType(permitType)
			setValue("permitType", permitType) // sincroniza com o formulário
			clearErrors("permitType") // limpa erro
		}
	}, [permitType])

	// CSS do canvas
	const webStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      height: 100%;
    }
    .m-signature-pad--body {
      border: 2px solid #000;
      border-radius: 8px;
      height: 100%;
    }
    .m-signature-pad--footer {
      display: none;
    }
  `

	// 🔄 Bloqueia rotação ao abrir/fechar modal
	useEffect(() => {
		async function lockOrientation() {
			if (modal === MODAL.SIGNATURE) {
				await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
			} else {
				await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
			}
		}
		lockOrientation()
	}, [modal])

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
				{/* Cabeçalho */}
				<HeaderBack title="Cadastrar Autuação" variant="primary" />
				<View className="flex p-4">
					{/* Numero da infração */}
					<View className="flex-row items-center mb-5">
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

					{/* Categoria do Veículo: */}
					<View className="mb-4">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Tipo de Alvará:
						</Text>
						<Controller
							control={control}
							name="permitType"
							rules={{
								required: permitType ? false : "Selecione o tipo de alvará!",
							}}
							render={({ field: { onChange, value } }) => (
								<DropdownButton
									data={permitTypeOption}
									placeholder="Tipo de Alvará"
									value={permitType == "" ? value : permitType} // ✅ agora mostra o valor selecionado
									errorMessage={errors.permitType?.message} // ✅ mostra erro
									onSelect={(item) => {
										onChange(item.value) // ✅ atualiza o valor no formulário
										onSelectPermitType(item.value) // ✅ mantém sua lógica atual também
									}}
								/>
							)}
						/>
					</View>

					{/* Modo de abordagem */}
					{approach.length ? (
						<View className="mb-4">
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Modo de Abordagem:
							</Text>
							<Controller
								control={control}
								name="abordagem"
								rules={{ required: "Selecione o modo de abordagem!" }}
								render={({ field: { onChange, value } }) => (
									<DropdownButton
										data={approach}
										placeholder="Modo de abordagem"
										value={value} // ✅ agora mostra o valor selecionado
										errorMessage={errors.abordagem?.message} // ✅ mostra erro
										onSelect={(item) => {
											onChange(item.value) // ✅ atualiza o valor no formulário
											onSelectMode(item) // ✅ mantém sua lógica atual também
										}}
									/>
								)}
							/>
						</View>
					) : (
						<></>
					)}

					{/* Tipo de Condutor */}
					{abordagem === 1 && (
						<View className="mb-4">
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Tipo de Condutor:
							</Text>
							<Controller
								control={control}
								name="driverType"
								rules={{ required: "Selecione o tipo de Condutor!" }}
								render={({ field: { onChange, value } }) => (
									<DropdownButton
										data={driverType}
										placeholder="Tipo de Condutor"
										value={value} // ✅ agora mostra o valor selecionado
										errorMessage={errors.driverType?.message} // ✅ mostra erro
										onSelect={(item) => {
											onChange(item.value) // ✅ atualiza o valor no formulário
											onSelectDriverType(item.value) // ✅ mantém sua lógica atual também
										}}
									/>
								)}
							/>
						</View>
					)}

					{driverTypeId && driverTypeId !== "1" && abordagem === 1 && (
						<View className="flex mb-4">
							<Text className="text-gray-500 font-regular text-2xl font-bold">
								Nome:
							</Text>
							<Field
								placeholder="Nome do Condutor"
								variant="primary"
								onChangeText={setDriverName}
								value={driverName}
							/>
							<View className="flex-row mt-4 justify-between gap-4">
								<View className="flex-1">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										CPF:
									</Text>
									<Field
										placeholder="CPF"
										variant="primary"
										onChangeText={setDriverCpf}
										onSubmitEditing={() => searchAssistentCPF(driverCpf)}
										returnKeyType="send"
										value={driverCpf}
									/>
								</View>
								<View className="flex-1">
									<Text className="text-gray-500 font-regular text-2xl font-bold">
										CNH:
									</Text>
									<Field
										placeholder="CNH"
										variant="primary"
										onChangeText={setDriverCnh}
										value={driverCnh}
									/>
								</View>
							</View>
						</View>
					)}

					{abordagem === 1 && (
						<>
							<Button
								variant="primary"
								className="mt-4"
								onPress={() => setModal(MODAL.SIGNATURE)}
							>
								<Button.TextButton title="Assinatura" />
							</Button>
							<Button
								className="flex-row gap-4 my-4"
								variant="primary"
								onPress={() => {
									setRefused(!refused)
								}}
							>
								{refused ? (
									<MaterialCommunityIcons
										name="check-circle-outline"
										size={30}
										color={colors.white}
									/>
								) : (
									<MaterialCommunityIcons
										name="circle"
										size={30}
										color={colors.white}
									/>
								)}
								<Button.TextButton title="Recusou-se a Assinar" />
							</Button>
						</>
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
						<Button
							className="mb-4"
							variant="primary"
							onPress={() => setModal(MODAL.IMAGENS)}
						>
							<Button.TextButton title={`Imagens(${imagens.length})`} />
						</Button>
					) : (
						<></>
					)}

					{/* Dados da Infração */}
					<View className="flex">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Local da Infração:
						</Text>
						<Controller
							control={control}
							name="local"
							rules={{
								required: "Informe o Local!",
							}}
							render={({ field: { onChange, value } }) => (
								<Field
									errorMessage={errors.local?.message}
									placeholder="Local"
									onChangeText={onChange}
									value={value}
									onSubmitEditing={Keyboard.dismiss}
									returnKeyType="send"
								/>
							)}
						/>

						{/* <Field
                placeholder="Local"
                variant="primary"
                onChangeText={setLocal}
                value={local}
              /> */}
						<Controller
							control={control}
							name="infracoes"
							rules={{
								required: "Selecione pelo menos uma infração!",
							}}
							render={({ field: { value } }) => (
								<Button
									className="mt-4"
									variant="primary"
									onPress={() => setModal(MODAL.INFRACAO)}
								>
									<Button.TextButton title="Código da Infração" />
								</Button>
							)}
						/>
						{errors.infracoes && (
							<Text className="text-red-500 mt-1 ml-1">
								{errors.infracoes.message}
							</Text>
						)}
					</View>

					{/* Mostra os códigos selecionados */}
					{textCod.length > 0 && (
						<View className="bg-gray-300 rounded-md px-3 my-4">
							<Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
								Códigos Selecionados:{" "}
								{idInfracao.length > 0 ? idInfracao.length : 0}
							</Text>
							<ScrollView
								style={{ height: 100 }} // altura fixa para a rolagem funcionar
								contentContainerStyle={{ paddingBottom: 50, gap: 10 }}
								showsVerticalScrollIndicator={false}
								nestedScrollEnabled={true}
							>
								{textCod.map((item) => (
									<View
										key={item}
										className="bg-white px-3 py-1 rounded-md border border-gray-400"
									>
										<Text className="text-sm font-medium">{item}</Text>
									</View>
								))}
							</ScrollView>
						</View>
					)}

					{/* Observação */}
					<View className="flex mb-5">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Observação:
						</Text>
						{refused && (
							<Text className="text-white text-xl font-semiBold bg-blue-500 p-2 rounded-md mb-2">
								O condutor se recusou a assinar o auto de infração.
							</Text>
						)}
						<Field
							placeholder="Descreva o assunto."
							variant="primary"
							onChangeText={setObs}
							value={obs}
							multiline={true}
							numberOfLines={2}
						/>
					</View>

					{/* Salvar */}
					<Button variant="primary" onPress={handleSubmit(postViolation)}>
						<Button.TextButton title="ENVIAR" />
					</Button>
				</View>

				{/* Modal de exibição das imagens */}
				<Modal
					className="bg-gray-200"
					variant="primary"
					visible={modal === MODAL.IMAGENS}
					onClose={() => setModal(MODAL.NONE)}
				>
					<View className="flex-1">
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
				</Modal>

				{/* Modal de seleção do código da infração */}
				<RNModal
					visible={modal === MODAL.INFRACAO}
					animationType="slide"
					onRequestClose={() => setModal(MODAL.NONE)}
				>
					<View className="flex-1 bg-white p-4">
						<TouchableOpacity
							activeOpacity={0.7}
							className="self-end mb-4"
							onPress={() => {
								filter("")
								setModal(MODAL.NONE)
							}}
						>
							<MaterialCommunityIcons
								name="close-circle-outline"
								size={40}
								color={colors.blue[500]}
							/>
						</TouchableOpacity>
						<Field
							placeholder="Código da Infração"
							variant="primary"
							onChangeText={filter}
						/>
						<FlatList
							data={selecText}
							renderItem={renderItem}
							keyExtractor={(item) => String(item.id)}
							showsVerticalScrollIndicator={false}
							scrollEnabled
						/>
					</View>
				</RNModal>

				{/* Assinatura */}
				<RNModal
					visible={modal === MODAL.SIGNATURE}
					animationType="slide"
					onRequestClose={() => setModal(MODAL.NONE)}
				>
					<View className="flex-row bg-white" style={{ width: height, height: width }}>
						{/* Painel lateral */}
						<View className="bg-gray-50 border-r border-gray-200 justify-center gap-4 ml-1">
							<Button variant="primary" onPress={() => setModal(MODAL.NONE)}>
								<Button.TextButton title="Fechar" />
							</Button>

							<Button variant="primary" onPress={handleClear}>
								<Button.TextButton title="Limpar" />
							</Button>

							<Button variant="primary" onPress={handleSave}>
								<Button.TextButton title="Salvar" />
							</Button>
						</View>

						{/* Área de assinatura */}
						<View className="flex-1 p-4 justify-center items-center">
							<SignatureCanvas
								ref={ref}
								onOK={handleSignature}
								webStyle={webStyle}
								backgroundColor="#fff"
								penColor="black"
								dataURL={signatureUri || ""}
							/>
						</View>
					</View>
				</RNModal>
			</KeyboardAwareScrollView>
			{isLoaded && <Loading />}
		</>
	)
}
