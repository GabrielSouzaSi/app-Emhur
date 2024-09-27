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

type ViolationCode = {
  id: number;
  code: string;
  description: string;
};

export default function HistoricoAutuacoes() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { user } = useAuth();
  const [violations, setViolations] = useState();
  const [codeViolation, setCodeViolation] = useState<ViolationCode[]>([]);
  const [dbCodeViolation, setDbCodeViolation] = useState<ViolationCode[]>([]);

  const database = useSQLiteContext(); // acessando o banco de dados
  const dbAutuacoes = drizzle(database, { schema: autuacaoSchema });
  const dbInfracoes = drizzle(database, { schema: infracaoSchema });

  const router = useRouter();

  const DATA = [
    {
      id: 1,
      code: "VC001",
      description: "Estacionamento irregular",
      ufm: 50,
      created_at: null,
      updated_at: null,
    },
    {
      id: 2,
      code: "VC002",
      description: "Velocidade acima do limite",
      ufm: 100,
      created_at: null,
      updated_at: null,
    },
    {
      id: 3,
      code: "VC003",
      description: "Falta de cinto de segurança",
      ufm: 30,
      created_at: null,
      updated_at: null,
    },
  ];

  // const autuacoes = sqliteTable("autuacoes");
  // const infracoes = sqliteTable("infracoes", {
  //   id: integer("id").primaryKey(),
  // });

  // Função para trazer os dados da tabela autuacoes
  async function getAutuacoes() {
    try {
      const response = await dbAutuacoes.query.autuacao.findMany();

      console.log("response => ", response);
    } catch (error) {
      console.log(error);
    }
  }

  // Função para trazer os dados da tabela infracoes
  async function fetchInfracoes() {
    try {
      const response = await dbInfracoes.query.infracao.findMany();

      console.log("response dbInfracoes => ", response);

      if (!response.length) {
        console.log("addInfracoes");

        addInfracoes();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoaded(false);
    }
  }
  // Função para adicionar as insfrações no banco
  async function addInfracoes() {
    try {
      await dbInfracoes
        .insert(infracaoSchema.infracao)
        .values(codeViolation)
        .run();

      fetchInfracoes();
    } catch (error) {
      console.log(error);
    }
  }

  const handleEdit = (item: any) => {
    console.log(item);

    router.push(`/${item}`);
  };

  // Função para receber as autuações do fiscal
  async function getViolations() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/agent/${user.id}/violations`);
      console.log(data.violations);
      

      setViolations(data.violations);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  // Função para receber o código das autuações
  async function getViolationsCode() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/violations-code`);
      // console.log("violations => ", data);
      const test = await data.map((item: ViolationCode) => {
        return {
          id: item.id,
          code: item.code,
          description: item.description,
        };
      });
      setCodeViolation(test);
    } catch (error) {
      throw error;
    } finally {
      fetchInfracoes();
    }
  }

  useEffect(() => {
    getViolations();
    getViolationsCode();
  }, []);
  useEffect(() => {
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
      <HeaderBack title="Histórico de Autuações" variant="primary" />

      {violations ? <DataTable data={violations} onEdit={handleEdit} /> : <></>}

      <View className="mx-4">
        <Button variant="primary" onPress={() => router.push("/autuacoes")}>
          <Button.TextButton title="Cadastrar Autuação" />
        </Button>
      </View>
      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
