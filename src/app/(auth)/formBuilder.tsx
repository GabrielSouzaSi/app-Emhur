import { useMemo, useState } from "react"
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native"

import { Button } from "@/components/button"
import { DropdownButton } from "@/components/buttonDropdown"
import { FormRenderer } from "@/components/FormRenderer"
import { HeaderBack } from "@/components/headerBack"
import { Field } from "@/components/input"
import type {
	ApiField,
	FormSchema,
	FormSection,
	ImageField,
	LocationField,
	SelectField,
	SelectItem,
	TextField,
} from "@/dtos/formTypes"

type FieldTypeOption = {
	label: string
	value:
		| "text"
		| "number"
		| "textarea"
		| "email"
		| "password"
		| "cpf"
		| "cnpj"
		| "cpf_cnpj"
		| "process"
		| "image"
		| "select"
		| "location"
}

const fieldTypeOptions: FieldTypeOption[] = [
	{ label: "Texto", value: "text" },
	{ label: "Número", value: "number" },
	{ label: "Textarea", value: "textarea" },
	{ label: "Email", value: "email" },
	{ label: "Senha", value: "password" },
	{ label: "CPF", value: "cpf" },
	{ label: "CNPJ", value: "cnpj" },
	{ label: "CPF/CNPJ", value: "cpf_cnpj" },
	{ label: "Processo", value: "process" },
	{ label: "Imagem", value: "image" },
	{ label: "Select", value: "select" },
	{ label: "Localização", value: "location" },
]

type DraftField = {
	name: string
	label: string
	type: FieldTypeOption["value"] | ""
	required: boolean
	placeholder: string
	minLength: string
	maxLength: string
	imageSource: "camera" | "gallery" | "both"
	multiple: boolean
	locationButtonLabel: string
	optionsText: string
}

const initialDraftField: DraftField = {
	name: "",
	label: "",
	type: "",
	required: false,
	placeholder: "",
	minLength: "",
	maxLength: "",
	imageSource: "both",
	multiple: false,
	locationButtonLabel: "Marcar posição",
	optionsText: "",
}

function slugify(text: string) {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "")
}

function parseSelectOptions(optionsText: string): SelectItem[] {
	return optionsText
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => {
			const [label, value] = line.includes("|")
				? line.split("|").map((part) => part.trim())
				: [line, slugify(line)]

			return {
				label,
				value,
			}
		})
}

function buildFieldFromDraft(draft: DraftField): ApiField | null {
	if (!draft.name.trim() || !draft.label.trim() || !draft.type) {
		return null
	}

	const base = {
		name: slugify(draft.name),
		label: draft.label.trim(),
		required: draft.required,
	}

	if (
		draft.type === "text" ||
		draft.type === "number" ||
		draft.type === "textarea" ||
		draft.type === "email" ||
		draft.type === "password" ||
		draft.type === "cpf" ||
		draft.type === "cnpj" ||
		draft.type === "cpf_cnpj" ||
		draft.type === "process"
	) {
		const field: TextField = {
			...base,
			type: draft.type,
			placeholder: draft.placeholder || undefined,
			minLength: draft.minLength ? Number(draft.minLength) : undefined,
			maxLength: draft.maxLength ? Number(draft.maxLength) : undefined,
		}
		return field
	}

	if (draft.type === "image") {
		const field: ImageField = {
			...base,
			type: "image",
			source: draft.imageSource,
			multiple: draft.multiple,
		}
		return field
	}

	if (draft.type === "location") {
		const field: LocationField = {
			...base,
			type: "location",
			buttonLabel: draft.locationButtonLabel || "Marcar posição",
			accuracy: "best",
		}
		return field
	}

	if (draft.type === "select") {
		const options = parseSelectOptions(draft.optionsText)

		const field: SelectField = {
			...base,
			type: "select",
			placeholder: draft.placeholder || "Selecione uma opção",
			options,
		}
		return field
	}

	return null
}

export default function FormBuilderScreen() {
	const [formId, setFormId] = useState("novo_formulario")
	const [title, setTitle] = useState("Novo Formulário")
	const [endpoint, setEndpoint] = useState("http://192.168.1.32:3333/forms/novo/multipart")
	const [schemaVersion, setSchemaVersion] = useState("1.0.0")

	const [sections, setSections] = useState<FormSection[]>([
		{
			id: "secao_1",
			title: "Seção 1",
			fields: [],
		},
	])

	const [selectedSectionId, setSelectedSectionId] = useState<string>("secao_1")
	const [draftField, setDraftField] = useState<DraftField>(initialDraftField)

	const [previewOpen, setPreviewOpen] = useState(false)
	const [jsonOpen, setJsonOpen] = useState(false)

	const selectedSection = useMemo(
		() => sections.find((section) => section.id === selectedSectionId) ?? null,
		[sections, selectedSectionId],
	)

	const generatedSchema: FormSchema = useMemo(
		() => ({
			id: slugify(formId),
			title: title.trim(),
			endpoint: endpoint.trim(),
			schemaVersion: schemaVersion.trim(),
			sections,
		}),
		[formId, title, endpoint, schemaVersion, sections],
	)

	function addSection() {
		const nextIndex = sections.length + 1
		const newSection: FormSection = {
			id: `secao_${nextIndex}`,
			title: `Seção ${nextIndex}`,
			fields: [],
		}

		setSections((prev) => [...prev, newSection])
		setSelectedSectionId(newSection.id)
	}

	function updateSection(sectionId: string, patch: Partial<FormSection>) {
		setSections((prev) =>
			prev.map((section) => (section.id === sectionId ? { ...section, ...patch } : section)),
		)
	}

	function removeSection(sectionId: string) {
		if (sections.length === 1) {
			Alert.alert("Atenção", "O formulário precisa ter ao menos uma seção.")
			return
		}

		setSections((prev) => prev.filter((section) => section.id !== sectionId))

		if (selectedSectionId === sectionId) {
			const next = sections.find((section) => section.id !== sectionId)
			if (next) setSelectedSectionId(next.id)
		}
	}

	function addFieldToSection() {
		if (!selectedSection) return

		const field = buildFieldFromDraft(draftField)

		if (!field) {
			Alert.alert("Atenção", "Preencha nome, label e tipo do campo.")
			return
		}

		const alreadyExists = selectedSection.fields.some((item) => item.name === field.name)

		if (alreadyExists) {
			Alert.alert("Atenção", "Já existe um campo com esse nome nesta seção.")
			return
		}

		setSections((prev) =>
			prev.map((section) =>
				section.id === selectedSection.id
					? { ...section, fields: [...section.fields, field] }
					: section,
			),
		)

		setDraftField(initialDraftField)
	}

	function removeField(sectionId: string, fieldName: string) {
		setSections((prev) =>
			prev.map((section) =>
				section.id === sectionId
					? {
							...section,
							fields: section.fields.filter((field) => field.name !== fieldName),
						}
					: section,
			),
		)
	}

	return (
		<View className="flex-1 bg-gray-100">
			<HeaderBack title="Builder de Formulário" variant="primary" />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 32 }}
			>
				<View className="mx-4 mt-4 rounded-2xl bg-white border-2 border-gray-300 p-4">
					<Text className="text-lg font-bold text-gray-800 mb-3">
						Dados do formulário
					</Text>

					<View className="mb-3">
						<Text className="text-gray-700 font-bold mb-2">ID</Text>
						<Field value={formId} onChangeText={setFormId} placeholder="fundiary_v3" />
					</View>

					<View className="mb-3">
						<Text className="text-gray-700 font-bold mb-2">Título</Text>
						<Field
							value={title}
							onChangeText={setTitle}
							placeholder="Título do formulário"
						/>
					</View>

					<View className="mb-3">
						<Text className="text-gray-700 font-bold mb-2">Endpoint</Text>
						<Field
							value={endpoint}
							onChangeText={setEndpoint}
							placeholder="URL do endpoint"
						/>
					</View>

					<View>
						<Text className="text-gray-700 font-bold mb-2">Versão</Text>
						<Field
							value={schemaVersion}
							onChangeText={setSchemaVersion}
							placeholder="1.0.0"
						/>
					</View>
				</View>

				<View className="mx-4 mt-4 rounded-2xl bg-white border-2 border-gray-300 p-4">
					<View className="flex-row items-center justify-between mb-3">
						<Text className="text-lg font-bold text-gray-800">Seções</Text>
						<Button variant="primary" onPress={addSection}>
							<Button.TextButton title="Nova seção" />
						</Button>
					</View>

					{sections.map((section) => {
						const isSelected = selectedSectionId === section.id

						return (
							<TouchableOpacity
								key={section.id}
								className={`rounded-xl border-2 p-3 mb-3 ${
									isSelected
										? "border-blue-500 bg-blue-50"
										: "border-gray-300 bg-white"
								}`}
								onPress={() => setSelectedSectionId(section.id)}
							>
								<Text className="font-bold text-gray-800">{section.title}</Text>
								<Text className="text-gray-500 mt-1">
									{section.fields.length} campo(s)
								</Text>

								<View className="flex-row mt-3">
									<View className="flex-1 mr-2">
										<Button
											variant="secundary"
											onPress={() => setSelectedSectionId(section.id)}
										>
											<Button.TextButton title="Selecionar" />
										</Button>
									</View>

									<View className="flex-1 ml-2">
										<Button
											variant="primary"
											onPress={() => removeSection(section.id)}
										>
											<Button.TextButton title="Remover" />
										</Button>
									</View>
								</View>
							</TouchableOpacity>
						)
					})}
				</View>

				{selectedSection ? (
					<View className="mx-4 mt-4 rounded-2xl bg-white border-2 border-gray-300 p-4">
						<Text className="text-lg font-bold text-gray-800 mb-3">Editar seção</Text>

						<View className="mb-3">
							<Text className="text-gray-700 font-bold mb-2">ID da seção</Text>
							<Field
								value={selectedSection.id}
								onChangeText={(text) =>
									updateSection(selectedSection.id, { id: slugify(text) })
								}
								placeholder="secao_1"
							/>
						</View>

						<View className="mb-3">
							<Text className="text-gray-700 font-bold mb-2">Título</Text>
							<Field
								value={selectedSection.title}
								onChangeText={(text) =>
									updateSection(selectedSection.id, { title: text })
								}
								placeholder="Título da seção"
							/>
						</View>

						<View>
							<Text className="text-gray-700 font-bold mb-2">Descrição</Text>
							<Field
								value={selectedSection.description ?? ""}
								onChangeText={(text) =>
									updateSection(selectedSection.id, { description: text })
								}
								placeholder="Descrição opcional"
							/>
						</View>
					</View>
				) : null}

				{selectedSection ? (
					<View className="mx-4 mt-4 rounded-2xl bg-white border-2 border-gray-300 p-4">
						<Text className="text-lg font-bold text-gray-800 mb-3">Novo campo</Text>

						<View className="mb-3">
							<Text className="text-gray-700 font-bold mb-2">Nome interno</Text>
							<Field
								value={draftField.name}
								onChangeText={(text) =>
									setDraftField((prev) => ({ ...prev, name: text }))
								}
								placeholder="process_number"
							/>
						</View>

						<View className="mb-3">
							<Text className="text-gray-700 font-bold mb-2">Label</Text>
							<Field
								value={draftField.label}
								onChangeText={(text) =>
									setDraftField((prev) => ({ ...prev, label: text }))
								}
								placeholder="Número do Processo"
							/>
						</View>

						<View className="mb-3">
							<Text className="text-gray-700 font-bold mb-2">Tipo</Text>
							<DropdownButton
								data={fieldTypeOptions}
								value={draftField.type || null}
								placeholder="Selecione o tipo"
								onSelect={(item) =>
									setDraftField((prev) => ({
										...prev,
										type: item.value as DraftField["type"],
									}))
								}
							/>
						</View>

						<View className="mb-3">
							<Text className="text-gray-700 font-bold mb-2">Placeholder</Text>
							<Field
								value={draftField.placeholder}
								onChangeText={(text) =>
									setDraftField((prev) => ({ ...prev, placeholder: text }))
								}
								placeholder="Placeholder opcional"
							/>
						</View>

						<View className="mb-3">
							<Text className="text-gray-700 font-bold mb-2">
								Obrigatório? (true/false)
							</Text>
							<Field
								value={String(draftField.required)}
								onChangeText={(text) =>
									setDraftField((prev) => ({
										...prev,
										required: text.trim().toLowerCase() === "true",
									}))
								}
								placeholder="true ou false"
							/>
						</View>

						{[
							"text",
							"number",
							"textarea",
							"email",
							"password",
							"cpf",
							"cnpj",
							"cpf_cnpj",
							"process",
						].includes(draftField.type) ? (
							<>
								<View className="mb-3">
									<Text className="text-gray-700 font-bold mb-2">
										Tamanho mínimo
									</Text>
									<Field
										value={draftField.minLength}
										onChangeText={(text) =>
											setDraftField((prev) => ({ ...prev, minLength: text }))
										}
										placeholder="Ex.: 3"
										keyboardType="numeric"
									/>
								</View>

								<View className="mb-3">
									<Text className="text-gray-700 font-bold mb-2">
										Tamanho máximo
									</Text>
									<Field
										value={draftField.maxLength}
										onChangeText={(text) =>
											setDraftField((prev) => ({ ...prev, maxLength: text }))
										}
										placeholder="Ex.: 100"
										keyboardType="numeric"
									/>
								</View>
							</>
						) : null}

						{draftField.type === "image" ? (
							<>
								<View className="mb-3">
									<Text className="text-gray-700 font-bold mb-2">
										Origem da imagem
									</Text>
									<DropdownButton
										data={[
											{ label: "Câmera", value: "camera" },
											{ label: "Galeria", value: "gallery" },
											{ label: "Ambos", value: "both" },
										]}
										value={draftField.imageSource}
										placeholder="Selecione a origem"
										onSelect={(item) =>
											setDraftField((prev) => ({
												...prev,
												imageSource:
													item.value as DraftField["imageSource"],
											}))
										}
									/>
								</View>

								<View className="mb-3">
									<Text className="text-gray-700 font-bold mb-2">
										Múltiplas imagens? (true/false)
									</Text>
									<Field
										value={String(draftField.multiple)}
										onChangeText={(text) =>
											setDraftField((prev) => ({
												...prev,
												multiple: text.trim().toLowerCase() === "true",
											}))
										}
										placeholder="true ou false"
									/>
								</View>
							</>
						) : null}

						{draftField.type === "location" ? (
							<View className="mb-3">
								<Text className="text-gray-700 font-bold mb-2">Texto do botão</Text>
								<Field
									value={draftField.locationButtonLabel}
									onChangeText={(text) =>
										setDraftField((prev) => ({
											...prev,
											locationButtonLabel: text,
										}))
									}
									placeholder="Marcar posição"
								/>
							</View>
						) : null}

						{draftField.type === "select" ? (
							<View className="mb-3">
								<Text className="text-gray-700 font-bold mb-2">Opções</Text>
								<Text className="text-gray-500 mb-2">
									Use uma linha por opção. Formato: Label | valor
								</Text>
								<Field
									value={draftField.optionsText}
									onChangeText={(text) =>
										setDraftField((prev) => ({ ...prev, optionsText: text }))
									}
									placeholder={"Renovação | 1\nAutorização | 2"}
									multiline
								/>
							</View>
						) : null}

						<Button variant="primary" onPress={addFieldToSection}>
							<Button.TextButton title="Adicionar campo" />
						</Button>
					</View>
				) : null}

				{selectedSection ? (
					<View className="mx-4 mt-4 rounded-2xl bg-white border-2 border-gray-300 p-4">
						<Text className="text-lg font-bold text-gray-800 mb-3">
							Campos da seção
						</Text>

						{selectedSection.fields.length === 0 ? (
							<Text className="text-gray-500">Nenhum campo adicionado.</Text>
						) : (
							selectedSection.fields.map((field) => (
								<View
									key={field.name}
									className="rounded-xl border-2 border-gray-300 p-3 mb-3"
								>
									<Text className="font-bold text-gray-800">{field.label}</Text>
									<Text className="text-gray-500 mt-1">{nameAndType(field)}</Text>

									<View className="mt-3">
										<Button
											variant="primary"
											onPress={() =>
												removeField(selectedSection.id, field.name)
											}
										>
											<Button.TextButton title="Remover campo" />
										</Button>
									</View>
								</View>
							))
						)}
					</View>
				) : null}

				<View className="mx-4 mt-4">
					<View className="mb-3">
						<Button variant="primary" onPress={() => setPreviewOpen(true)}>
							<Button.TextButton title="Visualizar formulário" />
						</Button>
					</View>

					<Button variant="secundary" onPress={() => setJsonOpen(true)}>
						<Button.TextButton title="Gerar JSON" />
					</Button>
				</View>
			</ScrollView>

			<Modal visible={previewOpen} animationType="slide">
				<View className="flex-1 bg-gray-100">
					<FormRenderer
						schema={generatedSchema}
						onSubmit={(values) => {
							console.log("Preview submit:", values)
							Alert.alert("Preview", "Formulário renderizado com sucesso.")
						}}
					/>

					<View className="px-4 pb-6">
						<Button variant="primary" onPress={() => setPreviewOpen(false)}>
							<Button.TextButton title="Fechar preview" />
						</Button>
					</View>
				</View>
			</Modal>

			<Modal visible={jsonOpen} animationType="slide">
				<View className="flex-1 bg-white">
					<HeaderBack title="JSON Gerado" variant="primary" />

					<ScrollView className="flex-1 px-4 py-4">
						<Text className="text-sm text-gray-800">
							{JSON.stringify(generatedSchema, null, 2)}
						</Text>
					</ScrollView>

					<View className="px-4 pb-6">
						<Button variant="primary" onPress={() => setJsonOpen(false)}>
							<Button.TextButton title="Fechar JSON" />
						</Button>
					</View>
				</View>
			</Modal>
		</View>
	)
}

function nameAndType(field: ApiField) {
	return `${field.name} • ${field.type}`
}
