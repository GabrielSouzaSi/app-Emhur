import axios from "axios"
import * as FileSystem from "expo-file-system/legacy"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useContext, useEffect, useState } from "react"
import { Alert, Text, View } from "react-native"

import { NetworkContext } from "@/contexts/NetworkContext"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"

import {
	delDatabaseInspectionId,
	getDatabaseInspections,
	type DatabaseInspection,
} from "@/database/inspection"

import { Button } from "@/components/button"
import DataTable from "@/components/dataTable"
import DataTableOff from "@/components/dataTableOff"
import { HeaderBack } from "@/components/headerBack"
import { LoadingLight } from "@/components/loading"
import { Modal } from "@/components/modal"
import { ImageDTO } from "@/dtos/imageDTO"

enum MODAL {
	NONE = 0,
	OPTIONS = 1,
}

export default function MenuVistoria() {
	const { isConnect } = useContext(NetworkContext)
	const [isLoaded, setIsLoaded] = useState(false)
	const [isFocused, setIsFocused] = useState(false)
	const [modal, setModal] = useState(MODAL.NONE)
	const { user } = useAuth()
	const [inspections, setInspections] = useState<any>()
	const [inspectionsOff, setInspectionsOff] = useState<DatabaseInspection[]>([])
	const [inspectionSelected, setInspectionSelected] = useState<DatabaseInspection>()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()

	const handleEdit = (item: any) => {
		router.push(`/(auth)/inspection/${item}`)
	}

	// Abre o modal para exibir as opções da autuação selecionada
	const handleOption = (item: { id: number }) => {
		const selected = inspectionsOff.find((inspection) => inspection.id === item.id)
		if (!selected) return

		setInspectionSelected(selected)
		setModal(MODAL.OPTIONS)
	}

	// Função para receber as autuações do fiscal
	async function fetchInspections() {
		try {
			setIsLoaded(true)
			const { data } = await server.get(`/agent/${user?.id}/inspections`)
			setInspections(data.inspections)
			getInspections()
		} catch (error) {
			throw error
		} finally {
			setIsLoaded(false)
		}
	}

	// Função para buscar as vistorias no banco
	async function getInspections() {
		setIsLoaded(true)
		try {
			// Consulta as vistorias no banco
			const response = await getDatabaseInspections()
			setInspectionsOff(response)
		} catch (error) {
			setIsLoaded(false)
			throw error
		} finally {
			setIsLoaded(false)
		}
	}

	// Monta o mesmo payload para envio e reporte da vistoria pendente
	const buildInspectionPayload = async (inspection: DatabaseInspection["inspection"]) => {
		let newVehicle: any = {}
		const { data } = await server.get(`/vehicle/${inspection.vehicle}`)
		const permitHolderId = inspection.permitHolderId ?? data.permit_holder_id?.id

		if (!permitHolderId) {
			throw new Error("Responsável pelo alvará não encontrado")
		}

		const requiresNewVehicle = [6, 7, 8].includes(Number(inspection.inspectionReasonId))
		const plate = inspection.newVehicle?.trim().toUpperCase()
		if (requiresNewVehicle && !plate) {
			throw new Error("Informe a placa do novo veículo antes de enviar a vistoria.")
		}
		if (plate) {
			const result = await server.get("/vehicles/search", { params: { placa: plate } })
			newVehicle = result.data.data.find(
				(item: any) => item.id && item.plate_number?.trim().toUpperCase() === plate,
			)
			if (!newVehicle) {
				throw new Error(
					"Veículo não encontrado. Confira a placa informada ou verifique se o veículo já foi cadastrado.",
				)
			}
		}

		let inspectionItems: any = {}

		inspection.items.forEach((item) => {
			inspectionItems[item.id] = {
				item: item.item,
				additional_info: item.additional_info,
				status: item.status,
				exists: item.exists,
			}
		})

		const payload = {
			permit_id: `${data.permit_id}`,
			permit_holder_id: `${permitHolderId}`,
			vehicle_id: `${data.vehicle_id.id}`,
			...(inspection.newVehicle && { new_vehicle_id: `${newVehicle?.id}` }),
			user_id: `${user?.id}`,
			inspection_location_id: `${inspection.inspectionLocationId}`,
			inspection_reason_id: `${inspection.inspectionReasonId}`,
			inspection_date: inspection.data,
			inspection_time: inspection.hora,
			advertising: inspection.advertising,
			final_observations: inspection.obs,
			inspection_items: JSON.stringify(inspectionItems),
			inspection_result: inspection.status,
		}
		const formData = new FormData()
		Object.entries(payload).forEach(([key, value]) => formData.append(key, value))
		inspection.imagens.forEach((image: ImageDTO) => {
			formData.append("attachments[]", {
				...image,
				uri: image.uri,
				name: image.name,
				type: image.type,
			} as any)
		})

		return { formData, payload }
	}

	// Envia a vistoria pendente
	const sendInspectionSelected = async () => {
		if (!inspectionSelected || isSubmitting) return

		setModal(MODAL.NONE)
		setIsSubmitting(true)
		setIsLoaded(true)
		const { id, inspection } = inspectionSelected
		try {
			const { formData } = await buildInspectionPayload(inspection)
			await server.postForm(`/inspections`, formData)
			await delDatabaseInspectionId(id)
			Alert.alert("Sucesso", "Vistoria enviado com sucesso!")
			fetchInspections()
			// Função para trazer os dados da tabela inspections
			const response = await getDatabaseInspections()
			setInspectionsOff(response)
		} catch (error: any) {
			setIsLoaded(false)
			const message = error?.response?.data?.message ?? error?.message ?? "Tente novamente!"
			console.error("sendInspectionSelected error =>", error?.response?.data ?? error)
			Alert.alert("Algo deu errado!", message)
		} finally {
			setIsLoaded(false)
			setIsSubmitting(false)
		}
	}

	const reportInspectionSelected = async () => {
		if (!inspectionSelected || isSubmitting) return

		setIsSubmitting(true)
		setIsLoaded(true)
		try {
			const { inspection } = inspectionSelected
			// O reporte deve incluir os dados locais mesmo sem cadastro na API.
			const payload = {
				user_id: user?.id,
				permit_holder_id: inspection.permitHolderId,
				vehicle: inspection.vehicle,
				newVehicle: inspection.newVehicle,
				inspection_location_id: inspection.inspectionLocationId,
				inspection_reason_id: inspection.inspectionReasonId,
				inspection_date: inspection.data,
				inspection_time: inspection.hora,
				advertising: inspection.advertising,
				final_observations: inspection.obs,
				inspection_items: JSON.stringify(
					Object.fromEntries(
						inspection.items.map((item) => [
							item.id,
							{
								item: item.item,
								additional_info: item.additional_info,
								status: item.status,
								exists: item.exists,
							},
						]),
					),
				),
				inspection_result: inspection.status,
			}
			const images = await Promise.all(
				inspectionSelected.inspection.imagens.map(async ({ uri, name, type }) => {
					const base64 = await FileSystem.readAsStringAsync(uri, {
						encoding: FileSystem.EncodingType.Base64,
					})

					return {
						name,
						type: type || "image/jpeg",
						base64,
					}
				}),
			)
			const route = `${server.defaults.baseURL?.replace(/\/$/, "") ?? ""}/inspections`
			const reportData = {
				...payload,
				attachments: images,
			}
			const report = {
				title: "Tentativa de envio de vistoria!",
				route,
				user: { id: user?.id, name: user?.name },
				data: reportData,
				message: `Tentativa de envio de vistoria!\nRota: ${route}\nUsuário: ${user?.name ?? "N/A"} (ID: ${user?.id ?? "N/A"})\nVeículo: ${inspectionSelected.inspection.vehicle ?? "N/A"}\nNovo Veículo: ${inspectionSelected.inspection.newVehicle ?? "N/A"}\nImagens: ${images.length}\nDados de envios:\n${JSON.stringify(payload, null, 2)}`,
			}
			await axios.post("https://n8n-n8n.zyrphk.easypanel.host/webhook/reports", report, {
				timeout: 180000,
			})
			setModal(MODAL.NONE)
			Alert.alert("Sucesso", "Vistoria reportada com sucesso!")
		} catch (error: any) {
			const message = error?.response?.data?.message ?? error?.message ?? "Tente novamente!"
			console.error("reportInspectionSelected error =>", error?.response?.data ?? error)
			Alert.alert("Algo deu errado!", message)
		} finally {
			setIsLoaded(false)
			setIsSubmitting(false)
		}
	}
	// Deleta a vistoria selecionada
	const delInspectionSelected = () => {
		if (!inspectionSelected || isSubmitting) return

		Alert.alert(
			"Excluir vistoria",
			"Deseja realmente excluir a vistoria selecionada? Essa ação não pode ser desfeita.",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Excluir",
					style: "destructive",
					onPress: async () => {
						setIsSubmitting(true)
						setModal(MODAL.NONE)
						setIsLoaded(true)
						try {
							await delDatabaseInspectionId(inspectionSelected.id)
							await getInspections()
							Alert.alert("Aviso!", "Vistoria excluída com sucesso!")
						} catch (error) {
							Alert.alert("Algo deu errado!", "Tente novamente!")
						} finally {
							setIsLoaded(false)
							setIsSubmitting(false)
						}
					},
				},
			],
			{ cancelable: true },
		)
	}

	useFocusEffect(
		useCallback(() => {
			setIsFocused(true) // Está focado.
			return () => {
				setIsFocused(false) // Não está focado.
			}
		}, []),
	)

	// Verifica a conexão
	useEffect(() => {
		isConnect && isFocused ? fetchInspections() : getInspections()
	}, [isConnect, isFocused])

	return (
		<View className="flex-1">
			<HeaderBack title="Histórico de Vistoria" variant="primary" />

			{isLoaded && <LoadingLight />}

			{inspectionsOff[0] ? (
				<View className="mx-4 mt-4">
					<Text className="text-gray-500 font-regular text-2xl font-bold">
						Vistorias Pendentes ({inspectionsOff.length}):
					</Text>
				</View>
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

			{inspectionsOff[0] && (
				<DataTableOff
					data={inspectionsOff.map(({ id, inspection }) => ({ id, ...inspection }))}
					onSend={handleOption}
				/>
			)}

			{inspections && isConnect && (
				<View className="mx-4">
					<Text className="text-gray-500 font-regular text-2xl font-bold">
						Vistoria Enviadas ({inspections.length}):
					</Text>
				</View>
			)}
			{isConnect && inspections && (
				<DataTable data={inspections} onEdit={handleEdit} type="inspection" />
			)}

			<View className="m-4">
				<Button variant="primary" onPress={() => router.push("/(auth)/vistoria")}>
					<Button.TextButton title="Cadastrar Vistoria" />
				</Button>
			</View>
			<Modal
				className="bg-gray-200"
				variant="primary"
				visible={modal === MODAL.OPTIONS}
				onClose={() => setModal(MODAL.NONE)}
			>
				<View className="flex-1 justify-center">
					<View className="gap-5">
						<Button variant="primary" onPress={() => sendInspectionSelected()}>
							<Button.TextButton title="Enviar" />
						</Button>
						<Button variant="primary" onPress={() => reportInspectionSelected()}>
							<Button.TextButton title="Reportar" />
						</Button>
						<Button variant="primary" onPress={() => delInspectionSelected()}>
							<Button.TextButton title="Excluir" />
						</Button>
					</View>
				</View>
			</Modal>
		</View>
	)
}
