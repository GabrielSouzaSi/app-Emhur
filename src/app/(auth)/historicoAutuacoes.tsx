import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, Text, View } from "react-native"

import { Button } from "@/components/button"
import DataTable from "@/components/dataTable"
import DataTableOff from "@/components/dataTableOff"
import { HeaderBack } from "@/components/headerBack"
import { LoadingLight } from "@/components/loading"
import { Modal } from "@/components/RNModal"
import { delDatabaseViolationId, getDatabaseViolations } from "@/database/violation"
import { ImageDTO } from "@/dtos/imageDTO"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"
import Toast from "react-native-toast-message"

enum MODAL {
	NONE = 0,
	OPTIONS = 1,
}

export default function HistoricoAutuacoes() {
	const [isLoaded, setIsLoaded] = useState(false)
	const [modal, setModal] = useState(MODAL.NONE)
	const { user } = useAuth()
	const [violations, setViolations] = useState<any>()
	const [autuacoes, setAutuacoes] = useState([])
	const [dBAutuacao, setDBAutuacao] = useState<any>()

	const router = useRouter()

	// Função para visualizar a autuação selecionada
	const handleEdit = (item: { id: string | number }) => {
		router.push(`/(auth)/${item}`)
	}
	// Abre o modal para exibir as opções da autuação selecionada
	const handleOption = (item: any) => {
		setDBAutuacao(item)
		setModal(MODAL.OPTIONS)
	}
	// Envia a autuação pendênte
	const sendViolationSelected = async () => {
		setModal(MODAL.NONE)
		setIsLoaded(true)
		try {
			const { data } = await server.get(`/vehicle/${dBAutuacao.vehicle}`)

			const formData = new FormData()
			formData.append("permit_holder_id", `${data.permit_holder_id.id}`)
			formData.append("user_id", `${user.id}`)
			formData.append("vehicle_id", `${data.vehicle_id.id}`)
			formData.append("approach_id", `${dBAutuacao.approach}`)
			dBAutuacao.idInfracao.forEach((id) => {
				formData.append("violation_code_id[]", id.toString())
			})
			formData.append("violation_date", dBAutuacao.data)
			formData.append("violation_time", dBAutuacao.hora)
			formData.append("latitude", `${dBAutuacao.latitude}`)
			formData.append("longitude", `${dBAutuacao.longitude}`)

			formData.append("driver_type_id", `${dBAutuacao.driverTypeId}`)
			formData.append(
				"driver_name",
				`${
					dBAutuacao.driverTypeId == "1"
						? data.permit_holder_id.name
						: dBAutuacao.driverName
				}`
			)
			formData.append(
				"driver_cpf",
				`${
					dBAutuacao.driverTypeId == "1"
						? data.permit_holder_id.cpf
						: dBAutuacao.driverCpf
				}`
			)
			formData.append(
				"driver_cnh",
				`${
					dBAutuacao.driverTypeId == "1"
						? data.permit_holder_id.cnh
						: dBAutuacao.driverCnh
				}`
			)

			formData.append("signature_base64", `${dBAutuacao.signatureUri}`)
			formData.append("address", dBAutuacao.local)
			formData.append("description", dBAutuacao.obs)
			dBAutuacao.imagens.forEach((image: ImageDTO) => {
				formData.append("attachments[]", {
					uri: image.uri,
					name: image.name,
					type: image.type,
				} as any)
			})
			formData.append("appeal_end_date", dBAutuacao.data)

			//console.log("Checklist salvo", JSON.stringify(formData, null, 2));

			await server.postForm(`/violations`, formData)
			await delDatabaseViolationId(dBAutuacao.id)
			Toast.show({
				type: "success",
				text1: "Autuação enviado com sucesso!",
			})
			fetchViolations()
			// Função para trazer os dados da tabela autuacoes
			const response = await getDatabaseViolations()
			setAutuacoes(response)
		} catch (error) {
			Toast.show({
				type: "error",
				text1: "Algo deu errado.",
				text2: `Tente novamente!`,
			})
		} finally {
			setIsLoaded(false)
		}
	}
	// Confirma se o usuario quer Deletar a autuação selecionada no banco
	const ConfirmDelViolationSelected = () => {
		Alert.alert("Atenção!", "Tem certeza que deseja excluir essa autuação?", [
			{ text: "Cancelar", style: "cancel" },
			{ text: "Excluir", onPress: () => delViolationSelected() },
		])
	}
	// Deleta a autuação selecionada no banco
	const delViolationSelected = async () => {
		setModal(MODAL.NONE)
		setIsLoaded(true)
		try {
			await delDatabaseViolationId(dBAutuacao.id)
			await getViolations()
			Alert.alert("Aviso!", "Autuação excluída com sucesso!")
		} catch (error) {
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
	}
	// Função para receber as autuações do fiscal logado
	async function fetchViolations() {
		setIsLoaded(true)
		await getViolations()
		try {
			const { data } = await server.get(`/agent/${user.id}/violations`)
			setViolations(data.violations)
		} catch (error) {
		} finally {
			setIsLoaded(false)
		}
	}
	// Função para buscar as autuações no banco
	async function getViolations() {
		try {
			// Consulta as autuações no bando
			const response = await getDatabaseViolations()
			setAutuacoes(response)
		} catch (error) {
			Alert.alert("Atenção!", "Erro ao buscar as autuações no banco!")
		}
	}
	// Chama a função fetchViolations sempre que entra na tela
	useFocusEffect(
		useCallback(() => {
			fetchViolations()
			return () => {}
		}, [])
	)

	return (
		<View className="flex-1">
			<HeaderBack title="Histórico de Autuações" variant="primary" />
			{isLoaded && <LoadingLight />}
			{autuacoes[0] ? (
				<>
					<View className="mt-4 mx-4">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Autuações Pendentes ({autuacoes.length}):
						</Text>
					</View>
					<DataTableOff data={autuacoes} onSend={handleOption} />
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

			{violations ? (
				<>
					<View className="mx-4">
						<Text className="text-gray-500 font-regular text-2xl font-bold">
							Autuações Enviadas ({violations.length}):
						</Text>
					</View>
					<DataTable data={violations} onEdit={handleEdit} type="violation" />
				</>
			) : (
				<></>
			)}

			<View className="m-4">
				<Button variant="primary" onPress={() => router.push("/(auth)/violation")}>
					<Button.TextButton title="Cadastrar Autuação" />
				</Button>
			</View>

			<Modal isOpen={modal === MODAL.OPTIONS}>
				<View className="bg-white w-full p-4 rounded-xl">
					<View className="gap-5">
						<Button variant="primary" onPress={() => sendViolationSelected()}>
							<Button.TextButton title="Enviar" />
						</Button>
						<Button variant="primary" onPress={() => ConfirmDelViolationSelected()}>
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
