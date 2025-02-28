import { Stack } from 'expo-router';
import { NetworkProvider } from '@/contexts/NetworkContext';

const FiscalLayout = () => {

	return (
		<NetworkProvider>
			<Stack screenOptions={{ headerShown: false }} />
		</NetworkProvider>
	);
};

export default FiscalLayout;