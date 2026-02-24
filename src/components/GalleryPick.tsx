import { ImageDTO } from "@/dtos/imageDTO"
import * as ImagePicker from "expo-image-picker"
import { Alert } from "react-native"
import { Button } from "./button"

type GalleryPickProps = {
	onChange?: (image: ImageDTO) => void // callback retorna o objeto da imagem
	disabled?: boolean // desabilita o botão
}

export function GalleryPick({ onChange, disabled }: GalleryPickProps) {
	async function handlePickImage() {
		try {
			// 1️⃣ Solicita permissão de acesso à galeria
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
			if (status !== "granted") {
				Alert.alert(
					"Permissão necessária",
					"É necessário permitir o acesso à galeria para selecionar imagens.",
				)
				return
			}

			// 2️⃣ Abre o seletor de imagens
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 1,
			})

			if (result.canceled) return

			const asset = result.assets[0]

			// 3️⃣ Cria o objeto compatível com o schema
			const imageObj: ImageDTO = {
				uri: asset.uri,
				name: asset.fileName ?? `${Date.now()}.jpeg`,
				type: asset.mimeType ?? "image/jpeg",
			}

			// 4️⃣ Retorna o objeto da imagem
			onChange?.(imageObj)
		} catch (error) {
			console.log("Erro ao selecionar imagem:", error)
		}
	}

	return (
		<Button variant="primary" onPress={handlePickImage} disabled={disabled}>
			<Button.TextButton
				title="Abrir Galeria"
				className={`${disabled ? "text-gray-900" : "text-white"}`}
			/>
		</Button>
	)
}
