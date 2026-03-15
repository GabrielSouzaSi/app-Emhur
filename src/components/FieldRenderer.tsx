// src/components/FieldRenderer.tsx
import * as Haptics from "expo-haptics"
import * as Location from "expo-location"
import React, { useEffect, useState } from "react"
import {
	Alert,
	FlatList,
	Image,
	Modal,
	Pressable,
	ReturnKeyTypeOptions,
	Text,
	TextInput,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { CameraSave } from "@/components/CameraSave"
import { GalleryPick } from "@/components/GalleryPick"
import { Field } from "@/components/input"
import { maskCNPJ, maskCPF, maskCpfCnpj } from "@/utils/cpfCnpj"
import { maskProcess } from "@/utils/maskProcess"
import { Button } from "./button"
import { DropdownButton } from "./buttonDropdown"

import type { ApiField, ImageField } from "@/dtos/formTypes"
import type { ImageDTO } from "@/dtos/imageDTO"
import { maskPhone } from "@/utils/maskPhone"

type FocusableRef =
	| {
			focus?: () => void
			blur?: () => void
	  }
	| TextInput
	| null

type Props = {
	field: ApiField
	value: any
	error?: string
	onChange: (name: string, value: any) => void

	inputRef?: (ref: FocusableRef) => void
	onSubmitEditing?: () => void
	returnKeyType?: ReturnKeyTypeOptions
	isLastField?: boolean
}

function FieldRendererComponent({
	field,
	value,
	error,
	onChange,
	inputRef,
	onSubmitEditing,
	returnKeyType,
	isLastField,
}: Props) {
	const [viewerOpen, setViewerOpen] = useState(false)
	const [selectedImageIndex, setSelectedImageIndex] = useState(0)

	switch (field.type) {
		case "select": {
			return (
				<View className="mb-4">
					{field.label === "" || field.label === null ? null : (
						<Text className="text-gray-700 font-bold mb-2">{field.label}</Text>
					)}

					<DropdownButton
						ref={inputRef as any}
						data={field.options}
						placeholder={field.placeholder ?? "Selecione uma opção"}
						errorMessage={error}
						value={value ?? null}
						onSelect={(item) => {
							onChange(field.name, item.value)
							if (!isLastField) {
								setTimeout(() => {
									onSubmitEditing?.()
								}, 150)
							}
						}}
					/>
				</View>
			)
		}

		case "image": {
			const f: ImageField = field
			const images = Array.isArray(value) ? value : value ? [value] : []
			const total = images.length

			function addImage(input: ImageDTO | ImageDTO[]) {
				const newImages = Array.isArray(input) ? input : [input]

				if (f.multiple) {
					const merged = [...images, ...newImages]

					const unique = merged.filter(
						(img, index, arr) => arr.findIndex((x) => x.uri === img.uri) === index,
					)

					onChange(f.name, unique)
				} else {
					onChange(f.name, newImages[0] ?? null)
				}
			}

			function removeImage(index: number) {
				Alert.alert("Remover imagem", "Deseja remover esta imagem?", [
					{ text: "Cancelar", style: "cancel" },
					{
						text: "Remover",
						style: "destructive",
						onPress: () => {
							const next = images.filter((_: ImageDTO, i: number) => i !== index)

							if (f.multiple) {
								onChange(f.name, next)
							} else {
								onChange(f.name, null)
							}

							if (selectedImageIndex >= next.length) {
								setSelectedImageIndex(Math.max(0, next.length - 1))
							}
						},
					},
				])
			}

			function openImage(index: number) {
				setSelectedImageIndex(index)
				setViewerOpen(true)
			}

			useEffect(() => {
				if (viewerOpen && total === 0) {
					setViewerOpen(false)
				}
			}, [viewerOpen, total])

			const showCamera = f.source === "camera" || f.source === "both"
			const showGallery = f.source === "gallery" || f.source === "both"
			const selectedImage = images[selectedImageIndex]

			return (
				<View className="mb-4">
					<Text className="text-gray-700 font-bold mb-2">{f.label}</Text>

					{showCamera && showGallery ? (
						<View className="flex-row justify-between">
							<View className="flex-1 mr-2">
								<CameraSave onChange={addImage} />
							</View>
							<View className="flex-1 ml-2">
								<GalleryPick onChange={addImage} multiple={f.multiple} />
							</View>
						</View>
					) : showCamera ? (
						<CameraSave onChange={addImage} />
					) : (
						<GalleryPick onChange={addImage} multiple={f.multiple} />
					)}

					{total > 0 ? (
						<View className="mt-4">
							<FlatList
								data={images}
								horizontal
								showsHorizontalScrollIndicator={false}
								keyExtractor={(item, index) => `${item.uri}-${index}`}
								contentContainerStyle={{ paddingRight: 8 }}
								ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
								renderItem={({ item, index }) => (
									<Pressable
										onPress={() => openImage(index)}
										onLongPress={() => removeImage(index)}
										delayLongPress={300}
										className="rounded-xl overflow-hidden border border-gray-200"
										style={{ width: 110, height: 110 }}
									>
										<Image
											source={{ uri: item.uri }}
											style={{
												width: "100%",
												height: "100%",
												backgroundColor: "#E5E7EB",
											}}
											resizeMode="cover"
										/>
									</Pressable>
								)}
							/>

							<Text className="text-xs text-gray-500 mt-2">
								Toque para ampliar • Segure para remover
							</Text>
						</View>
					) : null}

					<Modal
						visible={viewerOpen}
						transparent
						animationType="fade"
						onRequestClose={() => setViewerOpen(false)}
					>
						<SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.95)" }}>
							<View className="flex-1 items-center justify-center px-4">
								<Pressable
									className="absolute top-4 right-4 z-10 px-4 py-2 rounded-full bg-black/50"
									onPress={() => setViewerOpen(false)}
								>
									<Text className="text-white font-bold">Fechar</Text>
								</Pressable>

								{selectedImage ? (
									<>
										<Image
											source={{ uri: selectedImage.uri }}
											style={{
												width: "100%",
												height: "75%",
											}}
											resizeMode="contain"
										/>

										<View className="w-full mt-4">
											<FlatList
												data={images}
												horizontal
												showsHorizontalScrollIndicator={false}
												keyExtractor={(item, index) =>
													`${item.uri}-viewer-${index}`
												}
												contentContainerStyle={{ paddingHorizontal: 4 }}
												ItemSeparatorComponent={() => (
													<View style={{ width: 10 }} />
												)}
												renderItem={({ item, index }) => {
													const isActive = index === selectedImageIndex

													return (
														<Pressable
															onPress={() =>
																setSelectedImageIndex(index)
															}
															onLongPress={() => removeImage(index)}
															style={{
																width: 72,
																height: 72,
																borderRadius: 10,
																overflow: "hidden",
																borderWidth: isActive ? 2 : 1,
																borderColor: isActive
																	? "#3B82F6"
																	: "#4B5563",
																opacity: isActive ? 1 : 0.7,
															}}
														>
															<Image
																source={{ uri: item.uri }}
																style={{
																	width: "100%",
																	height: "100%",
																	backgroundColor: "#374151",
																}}
																resizeMode="cover"
															/>
														</Pressable>
													)
												}}
											/>
										</View>
									</>
								) : null}
							</View>
						</SafeAreaView>
					</Modal>

					{error ? <Text className="text-red-500 mt-1 ml-1">{error}</Text> : null}
				</View>
			)
		}

		// ✅ TEXTO / NUMBER / ETC
		case "cpf":
		case "cnpj":
		case "cpf_cnpj":
		case "phone":
		case "process":
		case "text":
		case "textarea":
		case "email":
		case "password":
		case "number": {
			const isTextArea = field.type === "textarea"

			const isNumericField =
				field.type === "process" ||
				field.type === "number" ||
				field.type === "cpf" ||
				field.type === "cnpj" ||
				field.type === "cpf_cnpj"

			const keyboardType =
				field.type === "phone"
					? "phone-pad"
					: isNumericField
						? "numeric"
						: field.type === "email"
							? "email-address"
							: "default"

			const shouldTrim = ["text", "textarea", "email", "password"].includes(field.type)

			const displayValue = (() => {
				const v = String(value ?? "")
				if (field.type === "cpf") return maskCPF(v)
				if (field.type === "cnpj") return maskCNPJ(v)
				if (field.type === "cpf_cnpj") return maskCpfCnpj(v)
				if (field.type === "process") return maskProcess(v)
				if (field.type === "phone") return maskPhone(v)
				return v
			})()

			return (
				<View className="mb-4">
					{field.label === "" || field.label === null ? null : (
						<Text className="text-gray-700 font-bold mb-2">{field.label}</Text>
					)}

					<Field
						ref={inputRef as any}
						value={displayValue}
						placeholder={field.placeholder}
						multiline={isTextArea}
						keyboardType={keyboardType}
						secureTextEntry={field.type === "password"}
						errorMessage={error}
						returnKeyType={returnKeyType}
						submitBehavior={isTextArea ? "newline" : "submit"}
						onSubmitEditing={() => {
							if (!isTextArea) {
								onSubmitEditing?.()
							}
						}}
						onBlur={() => {
							if (shouldTrim) {
								onChange(field.name, String(value ?? "").trim())
							}
						}}
						onChangeText={(text) => {
							if (field.type === "number") {
								const cleaned = text.replace(/[^\d.,]/g, "")
								onChange(field.name, cleaned)
								return
							}

							if (field.type === "process") {
								onChange(field.name, maskProcess(text))
								return
							}

							if (field.type === "phone") {
								onChange(field.name, text.replace(/\D/g, ""))
								return
							}

							if (
								field.type === "cpf" ||
								field.type === "cnpj" ||
								field.type === "cpf_cnpj"
							) {
								onChange(field.name, text.replace(/\D/g, ""))
								return
							}

							onChange(field.name, text)
						}}
					/>
				</View>
			)
		}
		case "location": {
			async function getGPS() {
				try {
					const { status } = await Location.requestForegroundPermissionsAsync()

					if (status !== "granted") {
						Alert.alert("Permissão necessária", "Permita o acesso à localização.")
						return
					}

					const location = await Location.getCurrentPositionAsync({
						accuracy: Location.Accuracy.High,
					})

					onChange(field.name, {
						latitude: location.coords.latitude,
						longitude: location.coords.longitude,
						accuracy: location.coords.accuracy,
					})
				} catch (error) {
					console.log(error)
				}
			}

			return (
				<View>
					<Text className="text-gray-700 font-bold mb-2">{field.label}</Text>

					<Pressable
						className="mb-2 w-full items-center justify-center p-4 rounded-md bg-blue-500 active:opacity-60"
						onLongPress={() => {
							getGPS()
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
						}}
					>
						<Button.TextButton title={field.buttonLabel ?? "Marcar posição"} />
					</Pressable>

					{error && <Text className="text-red-500 mb-4">{error}</Text>}

					{value && (
						<View className="flex-row justify-between gap-4 mb-4">
							{/* Latitude */}
							<View className="flex-1">
								<Text className="text-gray-500 font-regular font-bold">
									Latitude
								</Text>
								<Field
									variant="primary"
									value={String(value.latitude)}
									editable={false}
								/>
							</View>
							{/* Longitude */}
							<View className="flex-1">
								<Text className="text-gray-500 font-regular font-bold">
									Longitude
								</Text>
								<Field
									className="text-gray-500"
									variant="primary"
									value={String(value.longitude)}
									editable={false}
								/>
							</View>
						</View>
					)}
				</View>
			)
		}
	}
}

export const FieldRenderer = React.memo(FieldRendererComponent)
