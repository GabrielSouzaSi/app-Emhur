import React, { useCallback, useState } from "react";
import { useEffect } from "react";
import { View } from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { Button } from "@/components/button";
import { useRouter, useFocusEffect } from "expo-router";
import DataTable from "@/components/dataTable";
import { useAuth } from "@/hooks/useAuth";
import { server } from "@/server/api";
import { Loading } from "@/components/loading";

export default function MenuVistoria() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useAuth();
  const [inspections, setInspections] = useState();

  const router = useRouter();

  const handleEdit = (item: any) => {
    router.push(`/fiscal/inspection/${item}`);
  };

  // Função para receber as autuações do fiscal
  async function getInspections() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/agent/${user.id}/inspections`);
      setInspections(data.inspections);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  useEffect(() => {
    getInspections();
  }, []);

  useEffect(() => {
    if(isFocused){
      const intervalId = setInterval(getInspections, 30000); // Configura o intervalo de 30 segundos
      return () => clearInterval(intervalId);
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);// Está focado.
      getInspections();

      return () => {
        setIsFocused(false); // Não está focado.
      }
    }, [])
  );
  return (
    <View className="flex-1">
      <HeaderBack title="Histórico de Vistoria" variant="primary" />
      
    {inspections ? <DataTable data={inspections} onEdit={handleEdit} /> : <></>}

      <View className="m-4">
        <Button variant="primary" onPress={() => router.push("/fiscal/vistoria")}>
          <Button.TextButton title="Cadastrar Vistoria" />
        </Button>
      </View>
      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
