import React, { createContext, useState, useEffect } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export type NetworkContextDataProps = {
  isConnect: boolean | null; // null = ainda não sabe
};

export const NetworkContext = createContext<NetworkContextDataProps>({
  isConnect: null,
});

type Props = { children: React.ReactNode };

export const NetworkProvider = ({ children }: Props) => {
  const [isConnect, setIsConnect] = useState<boolean | null>(null);

  useEffect(() => {
    const computeReachable = (state: NetInfoState) =>
      state.isConnected === true && (state.isInternetReachable ?? true); // se for null no 1º tick, tratamos como true para não travar

    // leitura inicial (evita piscar como online ao abrir offline)
    NetInfo.fetch().then((state) => setIsConnect(computeReachable(state)));

    // assinante para mudanças
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnect(computeReachable(state));
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnect }}>
      {children}
    </NetworkContext.Provider>
  );
};
