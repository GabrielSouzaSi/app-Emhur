import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"

import { AUTH_STORAGE, SECURE_AUTH_STORAGE } from "@/storage/storageConfig"

export async function storageAuthTokenSave(token: string) {
	await SecureStore.setItemAsync(SECURE_AUTH_STORAGE, token)
	await AsyncStorage.removeItem(AUTH_STORAGE)
}

export async function storageAuthTokenGet() {
	const secureToken = await SecureStore.getItemAsync(SECURE_AUTH_STORAGE)

	if (secureToken) {
		return secureToken
	}

	// Migra silenciosamente sessões criadas antes da adoção do SecureStore.
	const legacyToken = await AsyncStorage.getItem(AUTH_STORAGE)

	if (!legacyToken) {
		return null
	}

	await SecureStore.setItemAsync(SECURE_AUTH_STORAGE, legacyToken)
	await AsyncStorage.removeItem(AUTH_STORAGE)

	return legacyToken
}

export async function storageAuthTokenRemove() {
	await Promise.all([
		SecureStore.deleteItemAsync(SECURE_AUTH_STORAGE),
		AsyncStorage.removeItem(AUTH_STORAGE),
	])
}
