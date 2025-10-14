import { useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, FlatList, Text, View } from "react-native";
import Constants from "expo-constants";

import { HeaderMenu } from "@/components/headerMenu";
import { MenuCard } from "@/components/menuCard";
import { server } from "@/server/api";
import { handleRequestError, registerSetIsLoaded } from "@/utils/errorHandler";

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

type MenuItemBase = {
  title: string;
  icon: string;
  route: string;
  empty?: false;
};

type MenuItemEmpty = {
  empty: true;
};

type MenuItem = MenuItemBase | MenuItemEmpty;

export default function HomeFiscal() {
  const { isConnect } = useContext(NetworkContext);
  const [isLoaded, setIsLoaded] = useState(false);

  const versao = Constants.expoConfig?.version || "Desconhecida";

  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      title: "Autuações",
      icon: "shield-account-outline",
      route: "/fiscal/historicoAutuacoes",
    },
    {
      title: "Vistorias",
      icon: "checkbox-outline",
      route: "/fiscal/menuVistoria",
    },
    {
      title: "Veículo",
      icon: "car-outline",
      route: "/fiscal/veiculo",
    },
    // {
    //   title: "Frequência",
    //   icon: "calendar-outline",
    //   route: "/fiscal/frequency",
    // },
  ];

  function isMenuItemBase(item: MenuItem): item is MenuItemBase {
    return !("empty" in item);
  }

  // Preenche a lista com espaços em branco
  const COLUMNS = 2;

  const fillMenu = (): MenuItem[] => {
    const remainder = menuItems.length % COLUMNS;
    if (remainder === 0) return menuItems;

    const fillers: MenuItem[] = Array.from(
      { length: COLUMNS - remainder },
      () => ({ empty: true })
    );

    return [...menuItems, ...fillers];
  };

  // Função para receber os motivos da vistoria
  async function getInspectionReasons() {
    setIsLoaded(true);
    try {
      const { data } = await server.get(`/inspection-reasons-all`);
      // Função para adicionar no banco os motivos da vistoria
      await delDatabaseReason(data);
      await getViolationsCode();
    } catch (error) {
      handleRequestError(
        "Não foi possível carregar os motivos da vistoria. Tente novamente.",
        error
      );
    }
  }

  // Função para receber o código das autuações
  async function getViolationsCode() {
    try {
      const { data } = await server.get(`/violations-code`);
      // console.log("violations => ", data);
      const violationsCodeData = data.map((item: ViolationCode) => {
        return {
          id: item.id,
          code: item.code,
          description: item.description,
        };
      });
      // Remover e adicionar no banco os codigos de autuação
      await delDatabaseViolationCode(violationsCodeData);
      await getApproach();
    } catch (error) {
      handleRequestError(
        "Não foi possível carregar os códigos de autuação. Tente novamente.",
        error
      );
    }
  }
  // Função para receber o modo de abordagem
  async function getApproach() {
    try {
      const { data } = await server.get(`/vehicle/1`);
      const { approach } = data;
      await delDatabaseApproach(approach);
      await getInspectionLocations();
    } catch (error) {
      handleRequestError(
        "Não foi possível carregar o modo de abordagem. Tente novamente.",
        error
      );
    }
  }
  // Função para buscar a lista dos locais da vistoria
  async function getInspectionLocations() {
    try {
      const { data } = await server.get("/inspection-locations");
      await delDatabaseInspectionLocation(data);
    } catch (error) {
      handleRequestError(
        "Não foi possível carregar os locais de vistoria. Tente novamente.",
        error
      );
    } finally {
      setIsLoaded(false);
    }
  }

  // Verifica a conexão
  useEffect(() => {
    if (isConnect === null) return; // ainda calculando
    if (isConnect === true) {
      getInspectionReasons();
    } else {
      Alert.alert("Aviso!", "Você não está conectado.");
      setIsLoaded(false);
    }
  }, [isConnect]);

  useEffect(() => {
    registerSetIsLoaded(setIsLoaded);
  }, []);

  return (
    <View className="flex-1">
      <HeaderMenu />

      <FlatList
        data={fillMenu()}
        numColumns={COLUMNS}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        renderItem={({ item }) =>
          isMenuItemBase(item) ? (
            <MenuCard
              onPress={() => router.push(item.route as any)}
              title={item.title}
              icon={item.icon as any}
              variant="primary"
            />
          ) : (
            <View className="flex-1 bg-transparent py-5 m-2" />
          )
        }
      />
      <Text className="absolute bottom-2 left-4 text-sm text-gray-500">{`V.: ${versao}`}</Text>

      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
