import { FormRenderer } from "@/components/FormRenderer"
import { getDatabaseLandSchemaForm } from "@/database/landSchemaForm"
import type { FormSchema } from "@/dtos/formTypes"
import { submitOrStoreOffline } from "@/services/formEngineService"
import { getOfflineEntryById } from "@/services/formOfflineService"
import { useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native"

type LandSchemaForm = {
	id: number
	type_form_id: number
	is_active: number
	schema: FormSchema
}

export default function FundiaryInspectionForm() {
	const { entryId, typeFormId } = useLocalSearchParams<{
		entryId?: string
		typeFormId?: string
	}>()

	const [schema, setSchema] = useState<LandSchemaForm | null>({
		id: 10,
		type_form_id: 1,
		is_active: 1,
		schema: {
			id: "fundiary_v3",
			title: "Formulário Dinâmico de Teste",
			schemaVersion: "1.0.0",
			endpoint: "/dynamic-test",
			sections: [
				{
					id: "identificacao",
					title: "Identificação",
					layout: [
						["service_order_number", "process_number"],
						["requester_name"],
						["requester_phone"],
						["requester_document"],
					],
					fields: [
						{
							name: "service_order_number",
							label: "Nº de Serviço",
							type: "process",
							placeholder: "Ex.: 2415/2026",
							required: true,
						},
						{
							name: "process_number",
							label: "Nº do Processo",
							type: "process",
							placeholder: "Ex.: 335643/2026",
							required: true,
						},
						{
							name: "requester_name",
							label: "Nome do Solicitante",
							type: "text",
							placeholder: "Digite o nome",
							required: true,
						},
						{
							name: "requester_phone",
							label: "Telefone",
							type: "phone",
							placeholder: "(95) 99999-9999",
						},
						{
							name: "requester_document",
							label: "CPF/CNPJ",
							type: "cpf_cnpj",
							placeholder: "Digite o CPF ou CNPJ",
						},
					],
				},

				{
					id: "denunciante",
					title: "Dados do Denunciante",
					layout: [
						["complainant_type"],
						["complainant_name"],
						["complainant_phone", "complainant_document"],
						["complainant_other_description"],
					],
					fields: [
						{
							name: "complainant_type",
							label: "Tipo de Denunciante",
							type: "select",
							placeholder: "Selecione uma opção",
							required: true,
							options: [
								{ label: "Anônimo", value: "anonymous" },
								{ label: "Identificado", value: "identified" },
								{ label: "Outros", value: "other" },
							],
						},
						{
							name: "complainant_name",
							label: "Nome do denunciante",
							type: "text",
							placeholder: "Digite o nome",
							required: true,
							visibleWhen: {
								field: "complainant_type",
								operator: "equals",
								value: "identified",
							},
						},
						{
							name: "complainant_phone",
							label: "Telefone do denunciante",
							type: "phone",
							placeholder: "(95) 99999-9999",
							visibleWhen: {
								field: "complainant_type",
								operator: "equals",
								value: "identified",
							},
						},
						{
							name: "complainant_document",
							label: "CPF do denunciante",
							type: "cpf",
							placeholder: "Digite o CPF",
							visibleWhen: {
								field: "complainant_type",
								operator: "equals",
								value: "identified",
							},
						},
						{
							name: "complainant_other_description",
							label: "Descreva",
							type: "textarea",
							placeholder: "Descreva a situação",
							required: true,
							visibleWhen: {
								field: "complainant_type",
								operator: "equals",
								value: "other",
							},
						},
					],
				},

				{
					id: "classificacao",
					title: "Classificação",
					layout: [
						["occupation_type_id"],
						["occupation_other_description"],
						["use_type_id"],
						["environmental_flag"],
						["environmental_description"],
					],
					fields: [
						{
							name: "occupation_type_id",
							label: "Tipo de Ocupação",
							type: "select",
							placeholder: "Selecione a ocupação",
							searchable: true,
							multiple: true,
							required: true,
							options: [
								{ label: "Requerente Mora", value: "1" },
								{ label: "Alugado", value: "2" },
								{ label: "Cedido", value: "3" },
								{ label: "Comercial", value: "4" },
								{ label: "Institucional", value: "5" },
								{ label: "Outros", value: "99" },
							],
						},
						{
							name: "occupation_other_description",
							label: "Descreva outra ocupação",
							type: "textarea",
							placeholder: "Descreva a outra ocupação",
							required: true,
							visibleWhen: {
								field: "occupation_type_id",
								operator: "includes",
								value: "99",
							},
						},
						{
							name: "use_type_id",
							label: "Tipo de Uso",
							type: "select",
							placeholder: "Selecione o tipo de uso",
							searchable: true,
							required: true,
							options: [
								{ label: "Residencial", value: "1" },
								{ label: "Comercial", value: "2" },
								{ label: "Misto", value: "3" },
								{ label: "Baldio", value: "4" },
								{ label: "Abandonado", value: "5" },
							],
						},
						{
							name: "environmental_flag",
							label: "Há influência ambiental?",
							type: "select",
							placeholder: "Selecione",
							required: true,
							options: [
								{ label: "Sim", value: "yes" },
								{ label: "Não", value: "no" },
							],
						},
						{
							name: "environmental_description",
							label: "Descreva a influência ambiental",
							type: "textarea",
							placeholder: "Descreva",
							required: true,
							visibleWhen: {
								field: "environmental_flag",
								operator: "equals",
								value: "yes",
							},
						},
					],
				},

				{
					id: "vistoria",
					title: "Dados da Vistoria",
					layout: [
						["inspection_type"],
						["inspection_schedule"],
						["inspection_team"],
						["gps"],
					],
					fields: [
						{
							name: "inspection_type",
							label: "Tipo de vistoria",
							type: "select",
							placeholder: "Selecione o tipo",
							required: true,
							options: [
								{ label: "Rotina", value: "routine" },
								{ label: "Urgente", value: "urgent" },
								{ label: "Denúncia", value: "complaint" },
							],
						},
						{
							name: "inspection_schedule",
							label: "Observação da programação",
							type: "textarea",
							placeholder: "Detalhes da programação",
							visibleWhen: {
								field: "inspection_type",
								operator: "equals",
								value: "urgent",
							},
						},
						{
							name: "inspection_team",
							label: "Equipe responsável",
							type: "text",
							placeholder: "Informe a equipe",
							visibleWhen: {
								field: "inspection_type",
								operator: "not_equals",
								value: "routine",
							},
						},
						{
							name: "gps",
							label: "Localização",
							type: "location",
							buttonLabel: "Capturar GPS",
							required: true,
						},
					],
				},

				{
					id: "midias",
					title: "Mídias",
					layout: [["front_photos"], ["document_photos"], ["extra_photos"]],
					fields: [
						{
							name: "front_photos",
							label: "Fotos da frente",
							type: "image",
							source: "both",
							multiple: true,
							required: true,
						},
						{
							name: "document_photos",
							label: "Fotos de documentos",
							type: "image",
							source: "both",
							multiple: true,
							visibleWhen: {
								field: "complainant_type",
								operator: "equals",
								value: "identified",
							},
						},
						{
							name: "extra_photos",
							label: "Fotos complementares",
							type: "image",
							source: "both",
							multiple: true,
						},
					],
				},
			],
		},
	})

	const [initialValues, setInitialValues] = useState<Record<string, unknown> | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true)
				setError(null)

				if (typeFormId) {
					const formSchema = await getDatabaseLandSchemaForm(Number(typeFormId))

					if (!formSchema) {
						setError("Schema não encontrado.")
						setSchema(null)
					} else {
						setSchema(formSchema)
					}
				} else {
					setError("typeFormId não informado.")
					setSchema(null)
				}

				if (entryId) {
					const entry = await getOfflineEntryById(Number(entryId))

					if (entry) {
						setInitialValues(JSON.parse(entry.data))
					}
				}
			} catch (err: any) {
				setError(err?.message ?? "Erro ao carregar formulário.")
			} finally {
				setLoading(false)
			}
		}

		//loadData()
	}, [entryId, typeFormId])

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text>Carregando formulário...</Text>
			</View>
		)
	}

	if (error) {
		return (
			<View className="flex-1 items-center justify-center px-4">
				<Text>{error}</Text>
			</View>
		)
	}

	if (!schema) {
		return (
			<View className="flex-1 items-center justify-center">
				<Text>Schema não encontrado.</Text>
			</View>
		)
	}

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ paddingBottom: 16 }}
			>
				<FormRenderer
					schema={schema.schema}
					initialValues={initialValues ?? undefined}
					onSubmit={async (values) => {
						const result = await submitOrStoreOffline(
							schema.schema,
							values,
							schema.type_form_id,
							entryId ? Number(entryId) : undefined,
						)

						if (result.mode === "online") {
							Alert.alert("Sucesso", "Formulário enviado com sucesso.")
							return
						}

						Alert.alert(
							"Sem envio online",
							`Não foi possível enviar agora. O formulário foi salvo offline.\n\nErro: ${result.errorMessage}`,
						)
					}}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
