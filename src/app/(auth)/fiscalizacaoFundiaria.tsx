import * as FileSystem from "expo-file-system/legacy"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, ScrollView, Text, View } from "react-native"
import Share from "react-native-share"

import { Button } from "@/components/button"
import DataTableOffFundiary from "@/components/dataTableOffFundiary"
import FundiaryCardOffline from "@/components/FundiaryCardOffline"
import { HeaderBack } from "@/components/headerBack"
import { LoadingLight } from "@/components/loading"
import { Modal } from "@/components/RNModal"
import { delDatabaseFormEntriesId, getDatabaseFormEntries } from "@/database/formEntries"
import {
	delDatabaseFundiaryInspection,
	getDatabaseFundiaryInspection,
} from "@/database/fundiaryInspections"
import { getDatabaseLandSchemaForm } from "@/database/landSchemaForm"
import { getDatabaseLandTypeForms } from "@/database/landTypeForm"
import { FundiaryInspectionDTO } from "@/dtos/FundiaryInspectionDTO"
import { server } from "@/server/api"
import { buildFormDataFromSchema } from "@/utils/formSubmission"
import axios from "axios"
import Toast from "react-native-toast-message"

enum MODAL {
	NONE = 0,
	OPTIONS = 1,
	TYPEFORMS = 2,
}

type TypeForm = {
	id: number
	name?: string
	description?: string
}

export default function HistoricoFiscalizacaoFundiaria() {
	const [isLoaded, setIsLoaded] = useState(false)
	const [modal, setModal] = useState(MODAL.NONE)
	const [inspectionsFundiary, setInspectionsFundiary] = useState([])
	const [selectedInspection, setSelectedInspection] = useState<FundiaryInspectionDTO | null>(null)
	const [rawJson, setRawJson] = useState<string | null>(null)
	const [cardForm, setCardForm] = useState<any[]>([])
	const [typeForms, setTypeForms] = useState<TypeForm[]>([])

	const router = useRouter()

	const handleOption = (item: FundiaryInspectionDTO) => {
		setSelectedInspection(item)
		setModal(MODAL.OPTIONS)
	}

	function buildRawPayload(item: FundiaryInspectionDTO) {
		return {
			service_order_number: item.serviceOrderNumber ?? "",
			process_number: item.processNumber.split("/")[0] ?? "",
			process_year: item.processNumber.split("/")[1] ?? "",
			requester_name: item.requesterName ?? "",
			requester_contact: item.requesterContact ?? "",
			address: item.address ?? "",
			neighborhood_id: item.neighborhoods ?? "",
			address_number: item.addressNumber ?? "",
			lot_number: item.lotNumber ?? "",
			block_number: item.blockNumber ?? "",
			area_registration_owner: item.areaRegistrationOwner ?? "",
			occupation_type_id: item.occupationTypeId ? String(item.occupationTypeId) : "",
			use_type_id: item.useTypeId ? String(item.useTypeId) : "",
			environmental_influence_type_id: item.environmentalInfluenceTypeId
				? String(item.environmentalInfluenceTypeId)
				: "",
			observations: item.observations ?? "",
			latitude: item.latitude ?? "",
			longitude: item.longitude ?? "",
			auto_number: "",
			inspection_date: item.date ?? "",
			inspection_time: item.time ?? "",
			confrontation_right: item.confrontationRight ?? "",
			confrontation_left: item.confrontationLeft ?? "",
			confrontation_back: item.confrontationBack ?? "",
			zone: item.zone ?? "",
			front_photos: item.frontPhotos ?? [],
			edification_photos: item.edificationPhotos ?? [],
			port_photos: item.portPhotos ?? [],
			perspective_photos: item.perspectivePhotos ?? [],
			extra_photos: item.extraPhotos ?? [],
		}
	}

	function buildShareMessage(item: FundiaryInspectionDTO) {
		return `
FISCALIZAÇÃO FUNDIÁRIA

Ordem de Serviço: ${item.serviceOrderNumber || "-"}
Ano da Ordem de Serviço: ${item.serviceOrderNumber.split("/")[1] || "-"}
Processo: ${item.processNumber || "-"}
Ano do Processo: ${item.processYear || "-"}
Requerente: ${item.requesterName || "-"}
Contato: ${item.requesterContact || "-"}
Endereço: ${item.address || "-"}
Bairro: ${item.neighborhoods || "-"}
Número: ${item.addressNumber || "-"}
Lote: ${item.lotNumber || "-"}
Quadra: ${item.blockNumber || "-"}
Proprietário do Registro: ${item.areaRegistrationOwner || "-"}
Zona: ${item.zone || "-"}

Confrontação Direita: ${item.confrontationRight || "-"}
Confrontação Esquerda: ${item.confrontationLeft || "-"}
Confrontação Fundos: ${item.confrontationBack || "-"}

Latitude: ${item.latitude || "-"}
Longitude: ${item.longitude || "-"}
Data: ${item.date || "-"}
Hora: ${item.time || "-"}

Observações:
${item.observations || "Sem observações"}
`.trim()
	}

	const viewRawJsonSelected = () => {
		if (!selectedInspection) return

		const payload = buildRawPayload(selectedInspection)
		const json = JSON.stringify(payload, null, 2)

		//console.log("JSON PURO FUNDIÁRIA:\n", json)
		setRawJson(json)
	}

	async function handleSendFundiaryInspection(id: number) {
		setIsLoaded(true)
		let result = cardForm.find((item) => item.id === id)
		let resul = await getDatabaseLandSchemaForm(result.type_form_id)

		const formData = buildFormDataFromSchema(resul.schema, result.data)

		//console.log(JSON.stringify(formData, null, 2))
		try {
			await server.postForm(result.endpoint, formData)
			await delDatabaseFormEntriesId(id)
			await load()
		} catch (error) {
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
	}

	async function prepareImagesForShare(item: FundiaryInspectionDTO) {
		const photos = [
			...(item.frontPhotos || []),
			...(item.edificationPhotos || []),
			...(item.portPhotos || []),
			...(item.perspectivePhotos || []),
			...(item.extraPhotos || []),
		]

		const rawUris = photos
			.map((photo: any) => photo?.uri || "")
			.filter(Boolean)
			.map((uri: string) => (uri.startsWith("file://") ? uri : `file://${uri}`))

		const preparedUris: string[] = []

		for (let i = 0; i < rawUris.length; i++) {
			const uri = rawUris[i]

			try {
				const info = await FileSystem.getInfoAsync(uri)

				if (!info.exists) {
					console.log("Arquivo não existe:", uri)
					continue
				}

				const extensionMatch = uri.match(/\.(jpg|jpeg|png|webp)$/i)
				const extension = extensionMatch?.[1]?.toLowerCase() || "jpg"

				const destUri = `${FileSystem.cacheDirectory}share_${Date.now()}_${i}.${extension}`

				await FileSystem.copyAsync({
					from: uri,
					to: destUri,
				})

				preparedUris.push(destUri)
			} catch (error) {
				console.log("Erro ao preparar imagem para compartilhamento:", uri, error)
			}
		}

		return preparedUris
	}

	async function cleanupSharedFiles(uris: string[]) {
		for (const uri of uris) {
			try {
				const info = await FileSystem.getInfoAsync(uri)
				if (info.exists) {
					await FileSystem.deleteAsync(uri, { idempotent: true })
				}
			} catch (error) {
				console.log("Erro ao limpar arquivo compartilhado:", uri, error)
			}
		}
	}

	const shareFundiaryInspectionSelected = async () => {
		if (!selectedInspection) return

		let preparedUris: string[] = []

		try {
			setModal(MODAL.NONE)
			setIsLoaded(true)

			const preparedUris = await prepareImagesForShare(selectedInspection)

			// console.log("Total de imagens preparadas:", preparedUris.length)
			// console.log("URIs:", preparedUris)

			if (preparedUris.length === 0) {
				Alert.alert("Atenção!", "Nenhuma imagem válida encontrada.")
				return
			}

			await Share.open({
				title: "Fiscalização Fundiária",
				message: buildShareMessage(selectedInspection),
				urls: preparedUris,
				type: "image/*",
				failOnCancel: false,
			})
		} catch (error) {
			console.log("ERRO AO COMPARTILHAR FUNDIÁRIA:", error)
			Alert.alert("Atenção!", "Não foi possível compartilhar a fiscalização.")
		} finally {
			await cleanupSharedFiles(preparedUris)
			setIsLoaded(false)
		}
	}

	const sendFundiaryInspectionSelected = async () => {
		if (!selectedInspection) return

		setModal(MODAL.NONE)
		setIsLoaded(true)

		try {
			const formData = new FormData()

			formData.append(
				"service_order_number",
				selectedInspection.serviceOrderNumber.split("/")[0] ?? "",
			)
			formData.append(
				"service_order_year",
				selectedInspection.serviceOrderNumber.split("/")[1] ?? "",
			)
			formData.append("process_number", selectedInspection.processNumber.split("/")[0] ?? "")
			formData.append("process_year", selectedInspection.processNumber.split("/")[1] ?? "")
			formData.append("requester_name", selectedInspection.requesterName ?? "")
			formData.append("requester_contact", selectedInspection.requesterContact ?? "")
			formData.append("address", selectedInspection.address ?? "")
			formData.append("neighborhood_id", selectedInspection.neighborhoods ?? "")
			formData.append("address_number", selectedInspection.addressNumber ?? "")
			formData.append("lot_number", selectedInspection.lotNumber ?? "")
			formData.append("block_number", selectedInspection.blockNumber ?? "")
			formData.append(
				"area_registration_owner",
				selectedInspection.areaRegistrationOwner ?? "",
			)

			formData.append(
				"occupation_type_id",
				selectedInspection.occupationTypeId
					? String(selectedInspection.occupationTypeId)
					: "",
			)
			formData.append(
				"use_type_id",
				selectedInspection.useTypeId ? String(selectedInspection.useTypeId) : "",
			)
			formData.append(
				"environmental_influence_type_id",
				selectedInspection.environmentalInfluenceTypeId
					? String(selectedInspection.environmentalInfluenceTypeId)
					: "",
			)

			formData.append("observations", selectedInspection.observations ?? "")

			selectedInspection.frontPhotos?.forEach((p: any) =>
				formData.append("front_photos[]", p),
			)
			selectedInspection.edificationPhotos?.forEach((p: any) =>
				formData.append("edification_photos[]", p),
			)
			selectedInspection.portPhotos?.forEach((p: any) => formData.append("port_photos[]", p))
			selectedInspection.perspectivePhotos?.forEach((p: any) =>
				formData.append("perspective_photos[]", p),
			)
			selectedInspection.extraPhotos?.forEach((p: any) =>
				formData.append("extra_photos[]", p),
			)

			formData.append("latitude", selectedInspection.latitude ?? "")
			formData.append("longitude", selectedInspection.longitude ?? "")

			formData.append("auto_number", "")
			formData.append("inspection_date", selectedInspection.date ?? "")
			formData.append("inspection_time", selectedInspection.time ?? "")

			formData.append("confrontation_right", selectedInspection.confrontationRight ?? "")
			formData.append("confrontation_left", selectedInspection.confrontationLeft ?? "")
			formData.append("confrontation_back", selectedInspection.confrontationBack ?? "")
			formData.append("zone", selectedInspection.zone ?? "")

			await server.postForm("/fundiary-inspections", formData)

			if (selectedInspection.id) {
				await delDatabaseFundiaryInspection(selectedInspection.id)
			}
			Toast.show({
				type: "success",
				text1: "Fiscalização enviada com sucesso!",
			})
			await getInspectionsFundiary()
		} catch (error: any) {
			console.log("ERRO ENVIO FUNDIÁRIA:", error?.response?.data ?? error)
			Alert.alert("Algo deu errado!", "Tente novamente!")
		} finally {
			setIsLoaded(false)
		}
	}

	const viewFundiaryInspectionSelected = () => {
		if (!selectedInspection) return

		router.push({
			pathname: "/(auth)/fundiariaForm",
			params: { id: selectedInspection.id },
		})

		setModal(MODAL.NONE)
	}

	async function preparePdfForShare(uri: string) {
		const normalizedUri = uri.startsWith("file://") ? uri : `file://${uri}`

		const info = await FileSystem.getInfoAsync(normalizedUri)
		if (!info.exists) {
			throw new Error("PDF não encontrado no dispositivo.")
		}

		const destUri = `${FileSystem.cacheDirectory}pdf_${Date.now()}.pdf`

		await FileSystem.copyAsync({
			from: normalizedUri,
			to: destUri,
		})

		return destUri
	}

	async function openPdfWithShare(uri: string) {
		const preparedUri = await preparePdfForShare(uri)

		await Share.open({
			title: "Visualizar PDF",
			url: preparedUri,
			type: "application/pdf",
			failOnCancel: false,
			showAppsToView: true,
		})

		return preparedUri
	}

	async function downloadPdf(url: string) {
		const fileUri = FileSystem.documentDirectory + `arquivo_${Date.now()}.pdf`

		const downloadResumable = FileSystem.createDownloadResumable(url, fileUri)
		const result = await downloadResumable.downloadAsync()

		if (!result || result.status !== 200) {
			throw new Error(`Falha no download do PDF. Status: ${result?.status ?? "sem resposta"}`)
		}

		return result.uri
	}

	const handleViewPDFSelected = async (id: number) => {
		setIsLoaded(true)

		let preparedPdfUri: string | null = null

		try {
			const selected = cardForm.find((item) => item.id === id)

			if (!selected) {
				throw new Error("Registro não encontrado na tabela.")
			}

			const schemaResult = await getDatabaseLandSchemaForm(selected.type_form_id)

			if (!schemaResult || !schemaResult.schema) {
				throw new Error("Schema não encontrado no banco.")
			}

			const formData = buildFormDataFromSchema(schemaResult.schema, selected.data)

			const response = await axios.postForm(
				"https://n8n-n8n.uwbc6t.easypanel.host/webhook-test/test",
				formData,
				{ timeout: 120000 },
			)

			const link = response?.data?.link

			if (!link || typeof link !== "string") {
				throw new Error("O webhook não retornou response.data.link")
			}

			const uri = await downloadPdf(link)
			console.log("PDF salvo em:", uri)

			preparedPdfUri = await openPdfWithShare(uri)
		} catch (error: any) {
			console.log("handleViewPDFSelected error =>", error)
			console.log("error.response?.data =>", error?.response?.data)
			console.log("error.message =>", error?.message)

			Alert.alert(
				"Algo deu errado!",
				error?.response?.data?.message || error?.message || "Tente novamente!",
			)
		} finally {
			if (preparedPdfUri) {
				try {
					await FileSystem.deleteAsync(preparedPdfUri, { idempotent: true })
				} catch {}
			}

			setIsLoaded(false)
		}
	}

	const confirmDeleteFundiaryInspection = (id?: number) => {
		console.log(id)

		if (id) {
			Alert.alert("Atenção!", "Tem certeza que deseja excluir essa fiscalização fundiária?", [
				{ text: "Cancelar", style: "cancel" },
				{ text: "Excluir", onPress: () => deleteFundiaryInspection(id) },
			])
		}

		if (!selectedInspection?.id) return

		Alert.alert("Atenção!", "Tem certeza que deseja excluir essa fiscalização fundiária?", [
			{ text: "Cancelar", style: "cancel" },
			{ text: "Excluir", onPress: () => deleteFundiaryInspection() },
		])
	}

	const deleteFundiaryInspection = async (id?: number) => {
		if (id) {
			setModal(MODAL.NONE)
			setIsLoaded(true)

			try {
				await delDatabaseFormEntriesId(id)
				await load()
				Alert.alert("Aviso!", "Fiscalização fundiária excluída com sucesso!")
			} catch (error) {
				Alert.alert("Algo deu errado!", "Tente novamente!")
			} finally {
				setIsLoaded(false)
			}
		}
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
			console.log(response)

			setInspectionsFundiary(response as any)
		} catch (error) {
			Alert.alert("Atenção!", "Erro ao buscar as fiscalizações fundiárias no banco!")
		}
	}

	async function load() {
		const [entryAll, typeForm] = await Promise.all([
			getDatabaseFormEntries(),
			getDatabaseLandTypeForms(),
		])

		setTypeForms(typeForm)
		// if (entryAll.length === 0) {
		// 	return
		// }

		// console.log(JSON.stringify(data, null, 2))
		setCardForm(entryAll)
	}

	useFocusEffect(
		useCallback(() => {
			load()
			getInspectionsFundiary()
			return () => {}
		}, []),
	)

	return (
		<View className="flex-1">
			<HeaderBack title="Histórico" variant="primary" />

			{isLoaded && <LoadingLight />}

			{inspectionsFundiary.length > 0 ? (
				<>
					<View className="mx-4 mt-4">
						<Text className="font-regular text-2xl font-bold text-gray-500">
							Fiscalizações Pendentes ({inspectionsFundiary.length}):
						</Text>
					</View>

					<DataTableOffFundiary data={inspectionsFundiary} onSend={handleOption} />
				</>
			) : (
				<View className="m-4 rounded-md border-2 border-gray-300 bg-white">
					<View className="border-b-2 border-gray-300">
						<Text className="font-regular my-2 ml-2 text-2xl font-bold text-gray-500">
							Aviso!
						</Text>
					</View>
					<View className="items-center justify-center">
						<Text className="font-regular my-4 text-base font-bold text-gray-500">
							Sem pendência local.
						</Text>
					</View>
				</View>
			)}

			{cardForm.length > 0 && (
				<FundiaryCardOffline
					data={cardForm}
					onDelete={confirmDeleteFundiaryInspection}
					onSend={handleSendFundiaryInspection}
					onView={handleViewPDFSelected}
				/>
			)}

			<View className="absolute bottom-1 w-full p-4 flex-row justify-center">
				<Button
					variant="primary"
					onPress={() => {
						//setModal(MODAL.TYPEFORMS)
						router.push("/(auth)/fundiariaForm")
					}}
				>
					<Button.TextButton title="Formulário" />
				</Button>
			</View>

			<Modal isOpen={modal === MODAL.TYPEFORMS}>
				<View className="w-full rounded-xl bg-white p-4">
					<View className="gap-5">
						{typeForms.length > 0 &&
							typeForms.map((typeForm) => (
								<Button
									key={typeForm.id}
									variant="primary"
									onPress={() => {
										router.push({
											pathname: "/(auth)/fundiariaFormold",
											params: { typeFormId: typeForm.id },
										})
										setModal(MODAL.NONE)
									}}
								>
									<Button.TextButton title={typeForm.name ?? ""} />
								</Button>
							))}
						<Button variant="primary" onPress={() => setModal(MODAL.NONE)}>
							<Button.TextButton title="Fechar" />
						</Button>
					</View>
				</View>
			</Modal>

			<Modal isOpen={modal === MODAL.OPTIONS}>
				<View className="w-full rounded-xl bg-white p-4">
					<View className="gap-5">
						<Button variant="primary" onPress={viewFundiaryInspectionSelected}>
							<Button.TextButton title="Visualizar" />
						</Button>

						<Button variant="primary" onPress={viewRawJsonSelected}>
							<Button.TextButton title="Visualizar JSON puro" />
						</Button>

						<Button variant="primary" onPress={shareFundiaryInspectionSelected}>
							<Button.TextButton title="Compartilhar c/ imagens" />
						</Button>

						<Button variant="primary" onPress={sendFundiaryInspectionSelected}>
							<Button.TextButton title="Enviar completo" />
						</Button>

						<Button variant="primary" onPress={() => confirmDeleteFundiaryInspection}>
							<Button.TextButton title="Excluir" />
						</Button>

						<Button variant="primary" onPress={() => setModal(MODAL.NONE)}>
							<Button.TextButton title="Fechar" />
						</Button>
					</View>
				</View>
			</Modal>
			<Modal isOpen={rawJson !== null}>
				<View className="w-full h-[80%] bg-white rounded-xl p-4">
					<Text className="text-lg font-bold mb-4">JSON da Fiscalização</Text>

					<ScrollView
						contentContainerStyle={{ paddingBottom: 20 }}
						className="flex-1 bg-gray-100 rounded p-3"
					>
						<Text className="text-xs text-gray-700">{rawJson}</Text>
					</ScrollView>

					<View className="mt-4">
						<Button variant="primary" onPress={() => setRawJson(null)}>
							<Button.TextButton title="Fechar" />
						</Button>
					</View>
				</View>
			</Modal>
		</View>
	)
}
