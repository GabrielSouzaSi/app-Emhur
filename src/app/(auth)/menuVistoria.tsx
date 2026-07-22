import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useContext, useEffect, useState } from "react"
import { Alert, Text, View } from "react-native"

import { NetworkContext } from "@/contexts/NetworkContext"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"

import { delDatabaseInspectionId, getDatabaseInspections } from "@/database/inspection"

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
	const [inspectionsOff, setInspectionsOff] = useState([])
	const [inspectionSelected, setInspectionSelected] = useState<any>()

	const router = useRouter()

	const handleEdit = (item: any) => {
		router.push(`/(auth)/inspection/${item}`)
	}

	// Abre o modal para exibir as opções da autuação selecionada
	const handleOption = (item: any) => {
		setInspectionSelected(item)
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
			const response: any = await getDatabaseInspections()
			setInspectionsOff(response)
		} catch (error) {
			setIsLoaded(false)
			throw error
		} finally {
			setIsLoaded(false)
		}
	}

	// Envia a vistoria pendente
	const sendInspectionSelected = async () => {
		setModal(MODAL.NONE)
		setIsLoaded(true)
		//console.log(inspectionSelected)

		let newVehicle: any = {}
		try {
			const { data } = await server.get(`/vehicle/${inspectionSelected.vehicle}`)
			// Buscar o veículo novo se existir
			if (inspectionSelected.newVehicle) {
				const result = await server.get(
					`/vehicles/search?placa=${inspectionSelected.newVehicle}`,
				)
				//console.log(JSON.stringify(result.data, null, 2))
				newVehicle = result.data.data[0]
			}

			let inspectionItems: any = {}

			inspectionSelected.items.forEach((item: any) => {
				inspectionItems[item.id] = {
					item: item.item,
					additional_info: item.additional_info,
					status: item.status,
					exists: item.exists,
				}
			})

			let formData = new FormData()
			formData.append("permit_id", `${data.permit_id}`)
			formData.append("permit_holder_id", `${data.permit_id}`)
			formData.append("vehicle_id", `${data.vehicle_id.id}`)
			if (inspectionSelected.newVehicle) {
				formData.append("new_vehicle_id", `${newVehicle?.id}`)
			}
			formData.append("user_id", `${user?.id}`)
			formData.append("inspection_location_id", `${inspectionSelected.inspectionLocationId}`)
			formData.append("inspection_reason_id", `${inspectionSelected.inspectionReasonId}`)
			formData.append("inspection_date", inspectionSelected.data)
			formData.append("inspection_time", inspectionSelected.hora)
			formData.append("advertising", inspectionSelected.advertising)
			formData.append("final_observations", inspectionSelected.obs)
			formData.append("inspection_items", JSON.stringify(inspectionItems))
			formData.append("inspection_result", inspectionSelected.status)
			inspectionSelected.imagens.forEach((image: ImageDTO) => {
				formData.append("attachments[]", {
					...image,
					uri: image.uri,
					name: image.name,
					type: image.type,
				} as any)
			})

			console.log("Checklist salvo", JSON.stringify(formData, null, 2))

			await server.postForm(`/inspections`, formData)
			await delDatabaseInspectionId(inspectionSelected.id)
			Alert.alert("Sucesso", "Vistoria enviado com sucesso!")
			fetchInspections()
			// Função para trazer os dados da tabela inspections
			const response: any = await getDatabaseInspections()
			setInspectionsOff(response)
		} catch (error) {
			setIsLoaded(false)
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
	}
	// Deleta a vistoria selecionada
	const delInspectionSelected = async () => {
		setModal(MODAL.NONE)
		setIsLoaded(true)
		try {
			await delDatabaseInspectionId(inspectionSelected.id)
			await getInspections()
			Alert.alert("Aviso!", "Vistoria excluída com sucesso!")
		} catch (error) {
			setIsLoaded(false)
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
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
				<View className="mx-4">
					<Text className="text-gray-500 font-regular text-2xl font-bold">
						Vistoria Pendentes ({inspectionsOff.length}):
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

			{inspectionsOff[0] && <DataTableOff data={inspectionsOff} onSend={handleOption} />}

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
						<Button variant="primary" onPress={() => delInspectionSelected()}>
							<Button.TextButton title="Excluir" />
						</Button>
					</View>
				</View>
			</Modal>
		</View>
	)
}
