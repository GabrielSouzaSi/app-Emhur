// src/components/CameraSave.tsx
import { ImageDTO } from "@/dtos/imageDTO"
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"
import * as MediaLibrary from "expo-media-library"
import { Keyboard } from "react-native"
import { Button } from "./button"

type CameraSaveProps = {
	onChange?: (img: ImageDTO) => void
	disabled?: boolean
}

async function normalizeCapturedImage(uri: string): Promise<ImageDTO> {
	const context = ImageManipulator.manipulate(uri)

	context.resize({ width: 1600 })

	const image = await context.renderAsync()

	const saved = await image.saveAsync({
		format: SaveFormat.JPEG,
		compress: 0.7,
	})

	return {
		uri: saved.uri,
		name: `image_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`,
		type: "image/jpeg",
	}
}

export function CameraSave({ onChange, disabled }: CameraSaveProps) {
	async function handleTakePhoto() {
		try {
			Keyboard.dismiss()

			const cameraPerm = await ImagePicker.requestCameraPermissionsAsync()
			if (!cameraPerm.granted) return

			const mediaPerm = await MediaLibrary.requestPermissionsAsync()
			if (!mediaPerm.granted) return

			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ["images"],
				quality: 0.5,
				exif: false,
			})

			if (result.canceled || !result.assets?.length) return

			const picked = result.assets[0]

			// salva a foto original na galeria
			await MediaLibrary.createAssetAsync(picked.uri)

			// retorna uma cópia normalizada para upload
			const normalized = await normalizeCapturedImage(picked.uri)

			onChange?.(normalized)
		} catch (e) {
			console.log("Erro ao capturar ou salvar imagem:", e)
		}
	}

	return (
		<Button variant="primary" onPress={handleTakePhoto} disabled={disabled}>
			<Button.TextButton
				title="Tirar Foto"
				className={disabled ? "text-gray-900" : "text-white"}
			/>
		</Button>
	)
}
