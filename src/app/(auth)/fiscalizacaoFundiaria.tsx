import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, Text, View } from "react-native"

import { Button } from "@/components/button"
import DataTableOffFundiary from "@/components/dataTableOffFundiary"
import { HeaderBack } from "@/components/headerBack"
import { LoadingLight } from "@/components/loading"
import { Modal } from "@/components/RNModal"
import {
	delDatabaseFundiaryInspection,
	getDatabaseFundiaryInspection,
} from "@/database/fundiaryInspections"
import { ImageDTO } from "@/dtos/imageDTO"
import { server } from "@/server/api"

enum MODAL {
	NONE = 0,
	OPTIONS = 1,
}

type DBInspection = Record<string, any>

/**
 * Formato que o DataTableOffFundiary espera (offline / banco)
 * (camelCase)
 */
export type Historico = {
	id: number
	serviceOrderNumber: string
	processNumber: string
	processYear: string
	requesterName: string
	requesterContact: string
	address: string
	addressNumber: string
	lotNumber: string
	blockNumber: string
	areaRegistrationOwner: string
	occupationTypeId: string
	useTypeId: string
	environmentalInfluenceTypeId: string
	observations: string
	frontPhotos: any
	edificationPhotos: any
	portPhotos: any
	perspectivePhotos: any
	extraPhotos: any
	latitude: string
	longitude: string
}

/**
 * Formato que o backend espera
 * (snake_case)
 */
type FundiaryInspectionForm = {
	id?: number
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

	observations: string

	front_photos: ImageDTO[]
	edification_photos: ImageDTO[]
	port_photos: ImageDTO[]
	perspective_photos: ImageDTO[]
	extra_photos: ImageDTO[]

	latitude: string
	longitude: string
}

const parsePhotos = (v: any): ImageDTO[] => {
	if (Array.isArray(v)) return v
	if (typeof v === "string") {
		try {
			const parsed = JSON.parse(v)
			return Array.isArray(parsed) ? (parsed as ImageDTO[]) : []
		} catch {
			return []
		}
	}
	return []
}

/**
 * Normaliza QUALQUER linha do banco para o formato Historico (camelCase),
 * para a tabela renderizar sem erro.
 */
const normalizeHistorico = (row: DBInspection): Historico => ({
	id: Number(row.id ?? 0),

	serviceOrderNumber: String(row.serviceOrderNumber ?? row.service_order_number ?? ""),
	processNumber: String(row.processNumber ?? row.process_number ?? ""),
	processYear: String(row.processYear ?? row.process_year ?? ""),

	requesterName: String(row.requesterName ?? row.requester_name ?? ""),
	requesterContact: String(row.requesterContact ?? row.requester_contact ?? ""),

	address: String(row.address ?? ""),
	addressNumber: String(row.addressNumber ?? row.address_number ?? ""),
	lotNumber: String(row.lotNumber ?? row.lot_number ?? ""),
	blockNumber: String(row.blockNumber ?? row.block_number ?? ""),

	areaRegistrationOwner: String(row.areaRegistrationOwner ?? row.area_registration_owner ?? ""),

	occupationTypeId: String(row.occupationTypeId ?? row.occupation_type_id ?? ""),
	useTypeId: String(row.useTypeId ?? row.use_type_id ?? ""),
	environmentalInfluenceTypeId: String(
		row.environmentalInfluenceTypeId ?? row.environmental_influence_type_id ?? "",
	),

	observations: String(row.observations ?? "Sem observações"),

	// aqui pode vir array ou string JSON ou null, então guardamos "cru"
	frontPhotos: row.frontPhotos ?? row.front_photos ?? "[]",
	edificationPhotos: row.edificationPhotos ?? row.edification_photos ?? "[]",
	portPhotos: row.portPhotos ?? row.port_photos ?? "[]",
	perspectivePhotos: row.perspectivePhotos ?? row.perspective_photos ?? "[]",
	extraPhotos: row.extraPhotos ?? row.extra_photos ?? "[]",

	latitude: String(row.latitude ?? ""),
	longitude: String(row.longitude ?? ""),
})

/**
 * Converte Historico (camelCase) -> FundiaryInspectionForm (snake_case),
 * já parseando as fotos.
 */
const toApiForm = (h: Historico): FundiaryInspectionForm => ({
	id: h.id,

	service_order_number: h.serviceOrderNumber,
	process_number: h.processNumber,
	process_year: h.processYear,

	requester_name: h.requesterName,
	requester_contact: h.requesterContact,

	address: h.address,
	address_number: h.addressNumber,
	lot_number: h.lotNumber,
	block_number: h.blockNumber,

	area_registration_owner: h.areaRegistrationOwner,

	occupation_type_id: h.occupationTypeId,
	use_type_id: h.useTypeId,
	environmental_influence_type_id: h.environmentalInfluenceTypeId,

	observations: h.observations ?? "Sem observações",

	front_photos: parsePhotos(h.frontPhotos),
	edification_photos: parsePhotos(h.edificationPhotos),
	port_photos: parsePhotos(h.portPhotos),
	perspective_photos: parsePhotos(h.perspectivePhotos),
	extra_photos: parsePhotos(h.extraPhotos),

	latitude: h.latitude,
	longitude: h.longitude,
})

export default function HistoricoFiscalizacaoFundiaria() {
	const [isLoaded, setIsLoaded] = useState(false)
	const [modal, setModal] = useState(MODAL.NONE)

	const [inspectionsFundiary, setInspectionsFundiary] = useState<Historico[]>([])
	const [selectedInspection, setSelectedInspection] = useState<Historico | null>(null)

	const router = useRouter()

	const handleOption = (item: Historico) => {
		setSelectedInspection(item)
		setModal(MODAL.OPTIONS)
	}

	const sendFundiaryInspectionSelected = async () => {
		if (!selectedInspection) return

		setModal(MODAL.NONE)
		setIsLoaded(true)

		try {
			const i = toApiForm(selectedInspection)

			const formData = new FormData()
			formData.append("service_order_number", i.service_order_number)
			formData.append("process_number", i.process_number)
			formData.append("process_year", i.process_year)
			formData.append("requester_name", i.requester_name)
			formData.append("requester_contact", i.requester_contact)
			formData.append("address", i.address)
			formData.append("address_number", i.address_number)
			formData.append("lot_number", i.lot_number)
			formData.append("block_number", i.block_number)
			formData.append("area_registration_owner", i.area_registration_owner)

			formData.append("occupation_type_id", i.occupation_type_id)
			formData.append("use_type_id", i.use_type_id)
			formData.append("environmental_influence_type_id", i.environmental_influence_type_id)

			formData.append("observations", i.observations)

			i.front_photos.forEach((p) => formData.append("front_photos[]", p as any))
			i.edification_photos.forEach((p) => formData.append("edification_photos[]", p as any))
			i.port_photos.forEach((p) => formData.append("port_photos[]", p as any))
			i.perspective_photos.forEach((p) => formData.append("perspective_photos[]", p as any))
			i.extra_photos.forEach((p) => formData.append("extra_photos[]", p as any))

			formData.append("latitude", i.latitude)
			formData.append("longitude", i.longitude)

			formData.append("auto_number", "")
			formData.append("inspection_date", "")
			formData.append("inspection_time", "")

			await server.postForm("/fundiary-inspections", formData)

			if (i.id) await delDatabaseFundiaryInspection(i.id)

			Alert.alert("Sucesso!", "Fiscalização enviada com sucesso!")
			await getInspectionsFundiary()
		} catch (error: any) {
			console.log("ERRO ENVIO FUNDIÁRIA:", error?.response?.data ?? error)
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
	}

	const confirmDeleteFundiaryInspection = () => {
		if (!selectedInspection?.id) return

		Alert.alert("Atenção!", "Tem certeza que deseja excluir essa fiscalização fundiária?", [
			{ text: "Cancelar", style: "cancel" },
			{ text: "Excluir", onPress: () => deleteFundiaryInspection() },
		])
	}

	const deleteFundiaryInspection = async () => {
		if (!selectedInspection?.id) return

		setModal(MODAL.NONE)
		setIsLoaded(true)

		try {
			await delDatabaseFundiaryInspection(selectedInspection.id)
			await getInspectionsFundiary()
			Alert.alert("Aviso!", "Fiscalização fundiária excluída com sucesso!")
		} catch (error) {
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
	}

	async function getInspectionsFundiary() {
		try {
			const response = await getDatabaseFundiaryInspection()
			setInspectionsFundiary((response as any[]).map(normalizeHistorico))
		} catch (error) {
			Alert.alert("Atenção!", "Erro ao buscar as fiscalizações fundiárias no banco!")
		}
	}

	useFocusEffect(
		useCallback(() => {
			getInspectionsFundiary()
			return () => {}
		}, []),
	)

	return (
		<View className="flex-1">
			<HeaderBack title="Histórico de Fiscalizações" variant="primary" />

			{isLoaded && <LoadingLight />}

			{inspectionsFundiary[0] ? (
				<>
					<View className="mt-4 mx-4">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Fiscalizações Pendentes ({inspectionsFundiary.length}):
						</Text>
					</View>

					<DataTableOffFundiary data={inspectionsFundiary} onSend={handleOption} />
				</>
			) : (
				<View className="m-4 bg-white border-2 rounded-md border-gray-300">
					<View className="border-b-2 border-gray-300">
						<Text className="ml-2 my-2 text-gray-500 font-regular text-2xl font-bold">
							Aviso!
						</Text>
					</View>
					<View className="justify-center items-center">
						<Text className="my-4 text-gray-500 font-regular text-base font-bold">
							Sem pendência local.
						</Text>
					</View>
				</View>
			)}

			<View className="m-4">
				<Button variant="primary" onPress={() => router.push("/(auth)/fundiariaForm")}>
					<Button.TextButton title="Fomulário" />
				</Button>
			</View>

			<Modal isOpen={modal === MODAL.OPTIONS}>
				<View className="bg-white w-full p-4 rounded-xl">
					<View className="gap-5">
						<Button variant="primary" onPress={sendFundiaryInspectionSelected}>
							<Button.TextButton title="Enviar" />
						</Button>

						<Button variant="primary" onPress={confirmDeleteFundiaryInspection}>
							<Button.TextButton title="Excluir" />
						</Button>

						<Button variant="primary" onPress={() => setModal(MODAL.NONE)}>
							<Button.TextButton title="Fechar" />
						</Button>
					</View>
				</View>
			</Modal>
		</View>
	)
}
