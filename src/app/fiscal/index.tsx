import { useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, View } from "react-native";

import { HeaderMenu } from "@/components/headerMenu";
import { MenuCard } from "@/components/menuCard";
import { server } from "@/server/api";

import { NetworkContext } from "@/contexts/NetworkContext";
import { delDatabaseReason } from "@/database/reason";
import { delDatabaseViolationCode } from "@/database/violationsCode";
import { delDatabaseApproach } from "@/database/approach";
import { Loading } from "@/components/loading";
import { delDatabaseInspectionLocation } from "@/database/InspectionLocation";

type ViolationCode = {
  id: number;
  code: string;
  description: string;
};

export default function HomeFiscal() {
  const { isConnect } = useContext(NetworkContext);
  const [ isLoaded, setIsLoaded ] = useState(false);

  const router = useRouter();

  // Função para receber os motivos da vistoria
  async function getInspectionReasons() {
    setIsLoaded(true);
    try {
      const { data } = await server.get(`/inspection-reasons-all`);
      // Função para adicionar no banco os motivos da vistoria
      delDatabaseReason(data);
      getViolationsCode();
    } catch (error) {
      setIsLoaded(false)
      throw error;
    }
  }

  // Função para receber o código das autuações
    async function getViolationsCode() {
      try {
        const { data } = await server.get(`/violations-code`);
        // console.log("violations => ", data);
        const violationsCodeData = await data.map((item: ViolationCode) => {
          return {
            id: item.id,
            code: item.code,
            description: item.description,
          };
        });
        // Remover e adicionar no banco os codigos de autuação
        delDatabaseViolationCode(violationsCodeData);
        getApproach()
      } catch (error) {
        setIsLoaded(false);
        throw error;
      }
    }
    // Função para receber o modo de abordagem
    async function getApproach() {
      try {
        const { data } = await server.get(`/vehicle/1`);
        const { approach } = data;
        await delDatabaseApproach(approach);
        getInspectionLocations();
      } catch (error) {
        setIsLoaded(false);
        throw error;
      }
    }
    // Função para buscar a lista dos locais da vistoria
      async function getInspectionLocations() {
        try {
          const { data } = await server.get("/inspection-locations");
          await delDatabaseInspectionLocation(data)
        } catch (error) {
          setIsLoaded(false);
          console.log(error);
        }finally{
          setIsLoaded(false)
        }
      }

  useEffect(() => {    
    isConnect ? getInspectionReasons() : Alert.alert("Aviso!", "Você não está conectado.")
  }, [])
  
  return (
    <View className="flex-1" >
      <HeaderMenu />
      <View className="flex flex-row justify-between px-5 ">
        <MenuCard
          onPress={() => router.push("/fiscal/menuFiscalizacao")}
          title="Fiscalização"
          icon="shield-account-outline"
          variant="primary"
        />
        <MenuCard
          onPress={() => router.push("/fiscal/menuVistoria")}
          title="Vistoria"
          icon="checkbox-outline"
          variant="primary"
        />
        <MenuCard
          onPress={() => router.push("/fiscal/veiculo")}
          title="Veículo"
          icon="car-outline"
          variant="primary"
        />
      </View>
       {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
