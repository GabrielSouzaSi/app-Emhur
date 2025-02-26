import { MenuCardSmall } from "@/components/menuCard";
import { useCallback, useState } from "react";
import { useEffect } from "react";
import { Alert, View } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as autuacaoSchema from "@/database/schemas/autuacaoSchema";
import * as infracaoSchema from "@/database/schemas/infracaoSchema";
import { HeaderBack } from "@/components/headerBack";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { Button } from "@/components/button";
import { useRouter, useFocusEffect } from "expo-router";
import DataTable from "@/components/dataTable";
import { useAuth } from "@/hooks/useAuth";
import { server } from "@/server/api";
import { Loading } from "@/components/loading";
import { string } from "yup";

export default function MenuVistoria() {
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
      const { data } = await server.get(`/agent/${user.id}/violations`);

      setViolations(data.violations);
    } catch (error) {
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
      <HeaderBack title="Histórico de Vistoria" variant="primary" />

      {violations ? <DataTable data={violations} onEdit={handleEdit} /> : <></>}

      <View className="mx-4">
        <Button variant="primary" onPress={() => router.push("/vistoria")}>
          <Button.TextButton title="Cadastrar Vistoria" />
        </Button>
      </View>
      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
