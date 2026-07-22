import { server } from "@/server/api"

import { delDatabaseApproach } from "@/database/approach"
import { delDatabaseDriverType } from "@/database/driverTypes"
import { delDatabaseFundiaryEnvironmentalInfluenceType } from "@/database/fundiaryEnvironmentalInfluenceType"
import { delDatabaseFundiaryOccupationType } from "@/database/fundiaryOccupationType"
import { delDatabaseFundiaryUseType } from "@/database/fundiaryUseType"
import { delDatabaseInspectionLocation } from "@/database/InspectionLocation"
import { delDatabaseLandSchemaForm } from "@/database/landSchemaForm"
import { delDatabaseLandTypeForm } from "@/database/landTypeForm"
import { delDatabaseNeighborhood } from "@/database/neighborhood"
import { delDatabasePermitType } from "@/database/permitType"
import { delDatabaseReason } from "@/database/reason"
import { delDatabaseViolationCode } from "@/database/violationsCode"
import Toast from "react-native-toast-message"

// Função para receber os motivos da vistoria
async function getInspectionReasons() {
	try {
		const { data } = await server.get(`/inspection-reasons-all`)
		// Função para adicionar no banco os motivos da vistoria
		await delDatabaseReason(data)
	} catch (error) {
		return "Motivos da Vistoria"
	}
}

// Função para receber o código das autuações
async function getViolationsCode() {
	try {
		const { data } = await server.get(`/violations-code`)
		// console.log("violations => ", data);

		const result: any = []

		data.forEach((item: any) => {
			item.permit_types.forEach((pt: any) => {
				result.push({
					id: Number(`${item.id}${pt.id}`),
					code: item.code,
					description: item.description,
					permitTypeId: pt.id,
				})
			})
		})

		// Remover e adicionar no banco os codigos de autuação
		await delDatabaseViolationCode(result)
	} catch (error) {
		return "Códigos de Autuações"
	}
}
// Função para receber os bairros
async function getNeighborhoods() {
	try {
		const { data } = await server.get(`/neighborhoods`)
		await delDatabaseNeighborhood(data)
	} catch (error) {
		return "Lista de Bairros!"
	}
}
// Função para receber os tipos de formulários fundiários
async function getLandTypeForms() {
	try {
		const { data } = await server.get(`/type-forms-all`)
		await delDatabaseLandTypeForm(data)
	} catch (error) {
		return "Lista de Tipos de Formulários Fundiários!"
	}
}
// Função para receber os Schemas dos formulários fundiários
async function getLandSchemaForms() {
	try {
		const { data } = await server.get(`/forms-all`)

		const result = data
			.filter((item: any) => item.is_active)
			.map((item: any) => ({
				id: item.id,
				type_form_id: item.type_form_id,
				is_active: Number(item.is_active),
				schema: JSON.stringify(item.schema[0]),
			}))

		await delDatabaseLandSchemaForm(result)
	} catch (error) {
		return "Lista dos Schemas dos Formulários Fundiários!"
	}
}
// Função para receber o tipo de condutor
async function getDriverType() {
	try {
		const { data } = await server.get(`/driver-types`)

		await delDatabaseDriverType(data)
	} catch (error) {
		return "Tipo de condutor"
	}
}
// Função para buscar a lista dos locais da vistoria
async function getInspectionLocations() {
	try {
		const { data } = await server.get("/inspection-locations")

		await delDatabaseInspectionLocation(data)
	} catch (error) {
		return "Locais de Vistoria"
	}
}
// Função para pegar os dados de configuração do app
async function getAll() {
	try {
		const { data } = await server.get("/search-all")

		const { approach, permitType } = data

		await delDatabaseApproach(approach)
		await delDatabasePermitType(permitType)
	} catch (error) {
		return "Dados de configuração do app"
	}
}
// Função para pegar os dados de configuração fundária
async function getFundiary() {
	try {
		const { data } = await server.get("/fundiary-search-all")

		const { fundiaryOccupationType, fundiaryUseType, fundiaryEnvironmentalInfluenceType } = data

		await delDatabaseFundiaryOccupationType(fundiaryOccupationType)
		await delDatabaseFundiaryUseType(fundiaryUseType)
		await delDatabaseFundiaryEnvironmentalInfluenceType(fundiaryEnvironmentalInfluenceType)
	} catch (error) {
		return "Dados de configuração fundária"
	}
}

export async function update() {
	Toast.show({
		type: "info",
		text1: "Verificando Dados...",
	})
	const results = await Promise.allSettled([
		getInspectionReasons(),
		getInspectionLocations(),
		getDriverType(),
		getViolationsCode(),
		getAll(),
		getFundiary(),
		getNeighborhoods(),
		getLandTypeForms(),
		getLandSchemaForms(),
	])

	// Coletar nomes dos erros
	const errors: string[] = []

	results.forEach((result) => {
		if (result.status === "fulfilled" && result.value) {
			// Se a função retornou uma string, é um erro
			errors.push(result.value)
		}

		if (result.status === "rejected") {
			// Algum erro não tratado (não deve ocorrer, mas por segurança)
			errors.push("Erro desconhecido")
		}
	})

	if (errors.length === 0) {
		Toast.show({
			type: "success",
			text1: "Dados atualizados com sucesso!",
		})
		return
	}

	// Montar mensagem de erro agrupada
	const msg = errors.join(", ")

	Toast.show({
		type: "error",
		text1: "Falha ao atualizar dados!",
		text2: `Itens com erro: ${msg}.`,
	})
}
