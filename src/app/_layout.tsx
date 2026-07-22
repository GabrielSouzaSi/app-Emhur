import { UpdateAppModal } from "@/components/UpdateAppModal"
import "@/styles/global.css"
import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { Stack, useRootNavigationState, useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { LogBox, StatusBar } from "react-native"
import Toast from "react-native-toast-message"

// Database
import { DATABASE_NAME, db, expoDb } from "@/database/connection"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import { SQLiteProvider } from "expo-sqlite"
import migrations from "../../drizzle/migrations"

import {
	Montserrat_400Regular,
	Montserrat_500Medium,
	Montserrat_600SemiBold,
	Montserrat_700Bold,
	useFonts,
} from "@expo-google-fonts/montserrat"

import { CustomToast } from "@/components/CustomToast"
import { AuthContextProvider } from "@/contexts/AuthContext"
import { useAuth } from "@/hooks/useAuth"
import { checkUpdate, UpdateInfo } from "@/utils/checkUpdate"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

SplashScreen.preventAutoHideAsync()

function StackLayout() {
	const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
	const [modalVisible, setModalVisible] = useState(false)
	const { user, isBootstrapping } = useAuth()
	const nav = useRootNavigationState()
	const { success, error } = useMigrations(db, migrations)
	useDrizzleStudio(expoDb)
	const router = useRouter()

	const [isFontLoaded] = useFonts({
		Montserrat_400Regular,
		Montserrat_500Medium,
		Montserrat_600SemiBold,
		Montserrat_700Bold,
	})
	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error
	}, [error])

	// Esconde o Splash quando router e boot estiverem prontos
	useEffect(() => {
		if (!isFontLoaded) return
		if (!nav?.key) return
		if (isBootstrapping) return
		SplashScreen.hideAsync().catch(() => {})
	}, [nav?.key, isBootstrapping, isFontLoaded])

	useEffect(() => {
		async function verifyUpdate() {
			const result = await checkUpdate()

			if (result?.hasUpdate) {
				setUpdateInfo(result)
				setModalVisible(true)
			}
		}

		verifyUpdate()
	}, [])

	// Durante o boot inicial, deixe o Splash cuidar da tela
	if (!nav?.key || isBootstrapping) return null

	const isLoggedIn = !!user?.id

	if (!__DEV__) {
		console.log = () => {}
		console.warn = () => {}
		console.error = () => {}
	}

	if (!__DEV__) {
		LogBox.ignoreLogs(["SafeAreaView has been deprecated"])
	}

	return (
		<SafeAreaProvider>
			<SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
				<StatusBar barStyle="dark-content" />
				<Stack
					screenOptions={{
						headerShown: false,
						// Deixe a cor de fundo do conteúdo igual ao splash para evitar “flash branco”
						contentStyle: { backgroundColor: "#fff" },
					}}
				>
					<Stack.Protected guard={!isLoggedIn}>
						<Stack.Screen name="index" />
					</Stack.Protected>

					<Stack.Protected guard={isLoggedIn}>
						<Stack.Screen name="(auth)" />
					</Stack.Protected>
				</Stack>
				{updateInfo && (
					<UpdateAppModal
						visible={modalVisible}
						version={updateInfo.latestVersion}
						message={updateInfo.message}
						releaseNotes={updateInfo.releaseNotes}
						storeUrl={updateInfo.storeUrl}
						required={updateInfo.required}
						onClose={() => setModalVisible(false)}
					/>
				)}
				<Toast
					config={{
						success: (props) => <CustomToast {...props} type="success" />,
						error: (props) => <CustomToast {...props} type="error" />,
						info: (props) => <CustomToast {...props} type="info" />,
					}}
				/>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

const RootLayoutNav = () => {
	return (
		<AuthContextProvider>
			<SQLiteProvider databaseName={DATABASE_NAME}>
				<StackLayout />
			</SQLiteProvider>
		</AuthContextProvider>
	)
}

export default RootLayoutNav
