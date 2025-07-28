import { useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, FlatList, View } from "react-native";

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

  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      title: "Fiscalização",
      icon: "shield-account-outline",
      route: "/fiscal/menuFiscalizacao",
    },
    {
      title: "Vistoria",
      icon: "checkbox-outline",
      route: "/fiscal/menuVistoria",
    },
    {
      title: "Veículo",
      icon: "car-outline",
      route: "/fiscal/veiculo",
    },
    {
      title: "Frequência",
      icon: "calendar-outline",
      route: "/fiscal/frequency",
    },
  ];

  function isMenuItemBase(item: MenuItem): item is MenuItemBase {
    return !("empty" in item);
  }

  // Preenche a lista com espaços em branco até múltiplos de 3
  const fillMenu = (): MenuItem[] => {
    const remainder = menuItems.length % 3;
    if (remainder === 0) return menuItems;

    const fillers: MenuItem[] = Array.from({ length: 3 - remainder }, () => ({
      empty: true,
    }));

    return [...menuItems, ...fillers];
  };

  // Função para receber os motivos da vistoria
  async function getInspectionReasons() {
    setIsLoaded(true);
    try {
      const { data } = await server.get(`/inspection-reasons-all`);
      // Função para adicionar no banco os motivos da vistoria
      delDatabaseReason(data);
      getViolationsCode();
    } catch (error) {
      setIsLoaded(false);
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
      getApproach();
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
      await delDatabaseInspectionLocation(data);
    } catch (error) {
      setIsLoaded(false);
      console.log(error);
    } finally {
      setIsLoaded(false);
    }
  }

  useEffect(() => {
    isConnect
      ? getInspectionReasons()
      : Alert.alert("Aviso!", "Você não está conectado.");
  }, []);

  return (
    <View className="flex-1">
      <HeaderMenu />

      <FlatList
        data={fillMenu()}
        numColumns={3}
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
            <View style={{ flex: 1, margin: 4 }} />
          )
        }
      />

      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
