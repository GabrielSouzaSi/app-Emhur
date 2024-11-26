import NetInfo from '@react-native-community/netinfo';
import * as Network from 'expo-network';

// Função global para verificar a conexão com a internet
export const checkInternetConnection = async (): Promise<any> => {
    const state = await NetInfo.fetch();

    return state.isConnected && state.isInternetReachable
};