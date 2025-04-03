import { Stack } from 'expo-router';
import { NetworkProvider } from '@/contexts/NetworkContext';

const PermitLayout = () => {

	return (
		<NetworkProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="index" />
			</Stack>
		</NetworkProvider>
	);
};

export default PermitLayout;