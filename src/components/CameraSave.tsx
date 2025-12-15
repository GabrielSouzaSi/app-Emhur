import { ImageDTO } from "@/dtos/imageDTO"
import * as ImagePicker from "expo-image-picker"
import { Button } from "./button"

type CameraSaveProps = {
	onChange?: (imagens: ImageDTO) => void // callback opcional para atualizar o banco ou o form
}

export function CameraSave({ onChange }: CameraSaveProps) {
	// Função principal de captura e salvamento
	async function handleTakePhoto() {
		try {
			// 1️⃣ Abre a câmera
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ["images"],
				allowsEditing: false,
				aspect: [4, 2],
				quality: 1,
			})

			if (result.canceled) return

			const uri = result.assets[0].uri

			const imageObj: ImageDTO = {
				uri: result.assets[0].uri,
				name: result.assets[0].fileName ?? `${Date.now()}.jpg`,
				type: "image/jpeg",
			}

			onChange?.(imageObj)
		} catch (error) {
			console.log("Erro ao capturar ou salvar imagem:", error)
		}
	}

	return (
		<Button variant="primary" onPress={handleTakePhoto}>
			<Button.TextButton title="Tirar Foto" />
		</Button>
	)
}
