// checkUpdate.ts

import Constants from "expo-constants"

export type UpdateInfo = {
	hasUpdate: boolean
	required: boolean
	currentVersion: string
	latestVersion: string
	message: string
	releaseNotes?: string[]
	storeUrl: string
}

type VersionApiResponse = {
	latestVersion: string
	minimumVersion?: string
	message?: string
	releaseNotes?: string[]
	storeUrl?: string
}

function compareVersions(currentVersion: string, remoteVersion: string) {
	const current = currentVersion.split(".").map(Number)
	const remote = remoteVersion.split(".").map(Number)

	const length = Math.max(current.length, remote.length)

	for (let index = 0; index < length; index++) {
		const currentNumber = current[index] ?? 0
		const remoteNumber = remote[index] ?? 0

		if (remoteNumber > currentNumber) {
			return 1
		}

		if (remoteNumber < currentNumber) {
			return -1
		}
	}

	return 0
}

export async function checkUpdate(): Promise<UpdateInfo | null> {
	try {
		const packageName = Constants.expoConfig?.android?.package
		const currentVersion = Constants.expoConfig?.version ?? "0.0.0"

		if (!packageName) {
			return null
		}

		const response = await fetch("https://n8n-n8n.uwbc6t.easypanel.host/webhook/appversion")

		if (!response.ok) {
			throw new Error(`Erro ao verificar atualização: ${response.status}`)
		}

		const data: VersionApiResponse = await response.json()

		if (!data.latestVersion) {
			throw new Error("A API não retornou a versão mais recente")
		}

		const hasUpdate = compareVersions(currentVersion, data.latestVersion) > 0

		const required = data.minimumVersion
			? compareVersions(currentVersion, data.minimumVersion) > 0
			: false

		return {
			hasUpdate,
			required,
			currentVersion,
			latestVersion: data.latestVersion,
			message: data.message ?? "Uma nova versão está disponível com correções e melhorias.",
			releaseNotes: data.releaseNotes ?? [],
			storeUrl:
				data.storeUrl ?? `https://play.google.com/store/apps/details?id=${packageName}`,
		}
	} catch (error) {
		console.error("Erro ao verificar atualização:", error)
		return null
	}
}
