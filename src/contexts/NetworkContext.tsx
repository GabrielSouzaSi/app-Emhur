import React, { createContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export type NetworkContextDataProps = {
  isConnect: boolean
};

// Criando o contexto
export const NetworkContext = createContext<NetworkContextDataProps>({} as NetworkContextDataProps);

// Componente para prover as informações de rede
export const NetworkProvider = ({ children }) => {
  const [isConnect, setIsConnect] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnect(state.isConnected);
    });

    // Cleanup quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnect }}>
      {children}
    </NetworkContext.Provider>
  );
};
