// src/app/(auth)/fundiariaFormold.tsx
import { FormRenderer } from "@/components/FormRenderer"
import { FormSchema } from "@/dtos/formTypes"
import { submitOrStoreOffline } from "@/services/formEngineService"
import { getOfflineEntryById } from "@/services/formOfflineService"
import axios from "axios"
import { useLocalSearchParams } from "expo-router"
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
	const { entryId } = useLocalSearchParams()

	const [schema, setSchema] = useState<FormSchema | null>(null)
	const [initialValues, setInitialValues] = useState<Record<string, any> | null>(null)

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function loadData() {
			try {
				setLoading(true)

				// carregar schema
				const response = await axios.get<FormSchema>(
					"http://192.168.1.32:3333/form-schemas/fundiary_v1",
				)

				setSchema(response.data)

				// carregar pendência se existir
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

		loadData()
	}, [entryId])

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
						initialValues={initialValues ?? undefined}
						onSubmit={async (values) => {
							const result = await submitOrStoreOffline(
								schema,
								values,
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
				) : (
					<View className="flex-1 items-center justify-center">
						<Text>Schema não encontrado.</Text>
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
