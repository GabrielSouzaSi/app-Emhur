import { NetworkProvider } from "@/contexts/NetworkContext"
import { Stack } from "expo-router"

const FiscalLayout = () => {
	return (
		<NetworkProvider>
			<Stack screenOptions={{ headerShown: false }} />
		</NetworkProvider>
	)
}

export default FiscalLayout
