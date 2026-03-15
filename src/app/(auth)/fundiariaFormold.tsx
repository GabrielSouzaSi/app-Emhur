// src/app/(auth)/fundiariaFormold.tsx
import { FormRenderer } from "@/components/FormRenderer"
import { FormSchema } from "@/dtos/formTypes"
import { submitOrStoreOffline } from "@/services/formEngineService"
import axios from "axios"
import { useEffect, useState } from "react"
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	View,
} from "react-native"

export default function FundiaryInspectionForm() {
	const [schema, setSchema] = useState<FormSchema | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	// const schema = useMemo<FormSchema>(
	// 	() => ({
	// 		id: "fundiary_v1",
	// 		title: "Atividade Fiscal",
	// 		endpoint: "/fundiary-inspections",
	// 		method: "POST",
	// 		sections: [
	// 			{
	// 				id: "process_info",
	// 				title: "Identificação do Processo",
	// 				layout: [["process_number", "service_order_number"]],
	// 				fields: [
	// 					{
	// 						name: "process_number",
	// 						label: "Número do Processo",
	// 						type: "process",
	// 						placeholder: "ex.: 123/2026",
	// 						required: true,
	// 						minLength: 4,
	// 					}
	// 				],
	// 			},

	useEffect(() => {
		async function loadSchema() {
			try {
				setLoading(true)
				setError(null)

				const response = await axios.get<FormSchema>(
					"http://192.168.1.32:3333/form-schemas/fundiary_v3",
				)
				//console.log("schema:", JSON.stringify(response.data, null, 2))

				setSchema(response.data)
			} catch (err: any) {
				setError(err?.message ?? "Erro ao carregar formulário.")
			} finally {
				setLoading(false)
			}
		}

		loadSchema()
	}, [])

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
				{loading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator />
						<Text>Carregando formulário...</Text>
					</View>
				) : error ? (
					<View className="flex-1 items-center justify-center px-4">
						<Text className="text-red-500 text-center">{error}</Text>
					</View>
				) : schema ? (
					<FormRenderer
						schema={schema}
						onSubmit={async (values) => {
							//console.log(values)

							const result = await submitOrStoreOffline(schema, values)

							if (result.mode === "online") {
								Alert.alert("Sucesso", "Formulário enviado com sucesso.")
								return
							}

							Alert.alert(
								"Sem envio online",
								`Não foi possível enviar agora. O formulário foi salvo offline.\n\nErro: ${result.errorMessage}`,
							)
							console.log(result.errorMessage)
						}}
					/>
				) : (
					<View className="flex-1 items-center justify-center">
						<Text>Schema não encontrado.</Text>
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
