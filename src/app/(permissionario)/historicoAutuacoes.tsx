import { useCallback, useState } from "react";
import { useEffect } from "react";
import { Alert, View } from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { Button } from "@/components/button";
import { useRouter, useFocusEffect } from "expo-router";
import DataTable from "@/components/dataTable";
import { useAuth } from "@/hooks/useAuth";
import { server } from "@/server/api";
import { Loading } from "@/components/loading";

export default function HistoricoAutuacoes() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useAuth();
  const [violations, setViolations] = useState();

  const router = useRouter();

  const handleEdit = (item: any) => {
    console.log(item);

    router.push("/1");
  };

  // Função para receber as autuações do fiscal
  async function getViolations() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/permit-holder/${user.id}/violations`);

      setViolations(data.violations);
    } catch (error) {
      console.log(error);
      
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  useEffect(() => {
    getViolations();
    if(isFocused){
      const intervalId = setInterval(getViolations, 30000); // Configura o intervalo de 30 segundos
      return () => clearInterval(intervalId);
    }
  }, [isFocused]);
  useFocusEffect( 
    useCallback(() => {
      setIsFocused(true);// Está focado.

      return () => {
        setIsFocused(false); // Não está focado.
      }
    }, [])
  );
  return (
    <View className="flex-1">
      <HeaderBack title="Histórico de Autuações" />

      {violations ? <DataTable data={violations} onEdit={handleEdit} /> : <></>}

      
      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
