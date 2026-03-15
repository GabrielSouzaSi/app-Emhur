// GalleryPick.tsx
import { ImageDTO } from "@/dtos/imageDTO"
import { ImageManipulator, SaveFormat } from "expo-image-manipulator"
import * as ImagePicker from "expo-image-picker"
import { Alert, Keyboard } from "react-native"
import { Button } from "./button"

type GalleryPickSingleProps = {
	onChange?: (image: ImageDTO) => void
	disabled?: boolean
	multiple?: false
}

type GalleryPickMultipleProps = {
	onChange?: (images: ImageDTO[]) => void
	disabled?: boolean
	multiple: true
}

type GalleryPickProps = GalleryPickSingleProps | GalleryPickMultipleProps

async function normalizeImage(
	asset: ImagePicker.ImagePickerAsset,
	index: number,
): Promise<ImageDTO> {
	const context = ImageManipulator.manipulate(asset.uri)

	// opcional, mas recomendado para upload mais leve
	context.resize({ width: 1600 })

	const image = await context.renderAsync()

	const saved = await image.saveAsync({
		format: SaveFormat.JPEG,
		compress: 0.7,
	})

	return {
		uri: saved.uri,
		name: `image_${Date.now()}_${index}_${Math.random().toString(36).slice(2)}.jpg`,
		type: "image/jpeg",
	}
}

export function GalleryPick(props: GalleryPickProps) {
	async function handlePickImage() {
		try {
			Keyboard.dismiss()

			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

			if (status !== "granted") {
				Alert.alert(
					"Permissão necessária",
					"É necessário permitir o acesso à galeria para selecionar imagens.",
				)
				return
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: false,
				allowsMultipleSelection: props.multiple === true,
				quality: 1,
			})

			if (result.canceled || !result.assets?.length) return

			const normalizedImages = await Promise.all(
				result.assets.map((asset, index) => normalizeImage(asset, index)),
			)

			if (props.multiple === true) {
				props.onChange?.(normalizedImages)
			} else {
				props.onChange?.(normalizedImages[0])
			}
		} catch (error) {
			console.log("Erro ao selecionar imagem:", error)
			Alert.alert("Erro", "Não foi possível selecionar a imagem.")
		}
	}

	return (
		<Button variant="primary" onPress={handlePickImage} disabled={props.disabled}>
			<Button.TextButton
				title="Galeria"
				className={props.disabled ? "text-gray-900" : "text-white"}
			/>
		</Button>
	)
}
