import { Stack } from 'expo-router';

const FiscalLayout = () => {

	return (
		<Stack screenOptions={{ headerShown: false }}>
		  <Stack.Screen name="index" />
		  <Stack.Screen name="autuacoes" />
		  <Stack.Screen name="consultarAutuacao" />
		  <Stack.Screen name="consultarVistoria" />
		  <Stack.Screen name="credencial" />
		  <Stack.Screen name="escala" />
		  <Stack.Screen name="menuFiscalizacao" />
		  <Stack.Screen name="menuVistoria" />
		  <Stack.Screen name="veiculo" />
		  <Stack.Screen name="vistoria" />
		</Stack>
	  );
};

export default FiscalLayout;