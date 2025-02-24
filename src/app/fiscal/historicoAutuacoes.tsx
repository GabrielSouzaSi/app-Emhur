import { useCallback, useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Alert, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as autuacaoSchema from "@/database/schemas/autuacaoSchema";
import * as infracaoSchema from "@/database/schemas/infracaoSchema";
import * as approachSchema from "@/database/schemas/approachSchema";

import { HeaderBack } from "@/components/headerBack";
import { Button } from "@/components/button";
import DataTable from "@/components/dataTable";
import DataTableOff from "@/components/dataTableOff";
import { useAuth } from "@/hooks/useAuth";
import { server } from "@/server/api";
import { Loading } from "@/components/loading";
import { Modal } from "@/components/modal";
import { checkInternetConnection } from "@/utils/networkStatus";
import { eq } from "drizzle-orm";

enum MODAL {
  NONE = 0,
  OPTIONS = 1,
}

type ViolationCode = {
  id: number;
  code: string;
  description: string;
};
type ApproachData = {
  id: number;
  name: string;
};

export default function HistoricoAutuacoes() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [modal, setModal] = useState(MODAL.NONE);
  const { user } = useAuth();
  const [violations, setViolations] = useState();
  const [autuacoes, setAutuacoes] = useState<any>();
  const [dBAutuacao, setDBAutuacao] = useState<any>();

  const [isConnected, setIsConnected] = useState<any>();

  const database = useSQLiteContext(); // acessando o banco de dados
  const dbAutuacoes = drizzle(database, { schema: autuacaoSchema });
  const dbInfracoes = drizzle(database, { schema: infracaoSchema });
  const dbApproach = drizzle(database, { schema: approachSchema });

  const router = useRouter();
  // Função para trazer os dados da tabela autuacoes
  async function getAutuacoes() {
    try {
      const response = await dbAutuacoes.query.autuacao.findMany();

      console.log("response => ", response);
      setAutuacoes(response);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoaded(false);
    }
  }
  // Função para trazer os dados da tabela infracoes
  async function fetchInfracoes() {
    try {
      const response = await dbInfracoes.query.infracao.findMany();

      console.log("response dbInfracoes => ", response);
    } catch (error) {
      console.log("fetchInfracoes =>" + error);
    } finally {
      setIsLoaded(false);
    }
  }
  // Função para trazer os dados da tabela approach
  async function fetchApproach() {
    try {
      const response = await dbApproach.query.approach.findMany();

      console.log("dbApproach => ", response);
    } catch (error) {
      console.log("fetchInfracoes error =>" + error);
    }
  }
  // Função para adicionar as insfrações no banco
  async function addInfracoes(data: ViolationCode[]) {
    try {
      await dbInfracoes.delete(infracaoSchema.infracao).run();
      await dbInfracoes.insert(infracaoSchema.infracao).values(data).run();

      fetchInfracoes();
    } catch (error) {
      console.log("addInfracoes =>" + error);
    }
  }
  // Função para adicionar os tipos de abordagem no banco
  async function addApproach(data: ApproachData[]) {
    try {
      await dbInfracoes.delete(approachSchema.approach).run();
      await dbInfracoes.insert(approachSchema.approach).values(data).run();

      fetchApproach();
    } catch (error) {
      console.log("addApproach error =>" + error);
    }
  }
  // Função para visualizar a autuação selecionada
  const handleEdit = (item: any) => {
    // console.log(item);
    router.push(`/fiscal/${item}`);
  };
  // Função para abrir o modal de opções da autuação selecionada
  const handleOption = (item: any) => {
    setDBAutuacao(item);
    setModal(MODAL.OPTIONS);
  };

  const handleSendAutuacao = async () => {
    console.log(dBAutuacao);
    try {
      const { data } = await server.get(`/vehicle/${dBAutuacao.vehicle}`);
      const formData = new FormData();
      formData.append("auto_number", `auto_number`);
      formData.append("permit_holder_id", `${data.permit_holder_id.id}`);
      formData.append("user_id", `${user.id}`);
      formData.append("vehicle_id", `${data.vehicle_id.id}`);
      formData.append("approach_id", `${dBAutuacao.approach}`);
      formData.append("violation_code_id", `${dBAutuacao.idInfracao}`);
      formData.append("violation_date", dBAutuacao.data);
      formData.append("violation_time", dBAutuacao.hora);
      formData.append("latitude", `${dBAutuacao.latitude}`);
      formData.append("longitude", `${dBAutuacao.longitude}`);
      formData.append("address", dBAutuacao.local);
      formData.append("description", dBAutuacao.obs);
      dBAutuacao.imagens.forEach((image: any) => {
        formData.append("attachments[]", {
          ...image,
          uri: image,
          name: `image_${new Date().getTime()}.jpg`,
          type: "image/jpeg",
        } as any);
      });
      formData.append("appeal_end_date", "2024-08-26");
      console.log(formData);

      await server.postForm(`/violations`, formData);
      Alert.alert("Sucesso", "Autuação enviado com sucesso!");
      await dbAutuacoes
        .delete(autuacaoSchema.autuacao)
        .where(eq(autuacaoSchema.autuacao.id, dBAutuacao.id));
      await getAutuacoes();
    } catch (error) {
      Alert.alert("Algo deu errado!", "Tente novamente!");
    }
  };

  const handleDeleteAutuacao = async () => {
    console.log(dBAutuacao);
    try {
      await dbAutuacoes
        .delete(autuacaoSchema.autuacao)
        .where(eq(autuacaoSchema.autuacao.id, dBAutuacao.id));
      Alert.alert("Aviso!", "Autuação excluída com sucesso!");
      await getAutuacoes();
    } catch (error) {
      Alert.alert("Algo deu errado!", "Tente novamente!");
    }
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
      getAutuacoes();
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
      addInfracoes(violationsCodeData);
    } catch (error) {
      throw error;
    }
  }
  async function getApproach() {
    try {
      const { data } = await server.get(`/vehicle/1`);
      const { approach } = data;
      addApproach(approach);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }
  //função checkInternetConnection para verificar o status de conexão
  const checkConnection = async () => {
    const connected = await checkInternetConnection();
    console.log(connected);
    setIsConnected(connected);
    return connected;
  };

  // Chama a função checkInternetConnection ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      setIsFocused(true); // Está focado.
      const result = async () => {
        let res = await checkConnection();
        res ? getViolations() : getAutuacoes();
      };
      result();
      return () => {
        setIsFocused(false); // Não está focado.
      };
    }, [])
  );
  // Verifica a conexão
  useEffect(() => {
    if (isFocused) {
      const intervalId = setInterval(checkConnection, 10000); // Configura o intervalo de 10 segundos
      return () => clearInterval(intervalId);
    }
  }, [isFocused]);

  useEffect(() => {
    if (isConnected && isFocused) {
      console.log("Codigo de violação!");
      getViolationsCode();
      getApproach();
    }
  }, [isConnected, isFocused]);

  return (
    <View className="flex-1">
      <HeaderBack title="Histórico de Autuações" variant="primary" />

      <View className="m-4">
        <MaterialCommunityIcons
          name="circle"
          size={24}
          color={isConnected ? "green" : "red"}
        />
      </View>
      {violations ? (
        <View className="mx-4">
          <Text className="text-gray-500 font-regular text-2xl font-bold">
            Autuações Pendentes:
          </Text>
        </View>
      ) : (
        <></>
      )}

      {autuacoes ? (
        <DataTableOff data={autuacoes} onSend={handleOption} />
      ) : (
        <></>
      )}
      {violations ? (
        <View className="mx-4">
          <Text className="text-gray-500 font-regular text-2xl font-bold">
            Autuações Enviadas:
          </Text>
        </View>
      ) : (
        <></>
      )}
      {violations ? <DataTable data={violations} onEdit={handleEdit} /> : <></>}
      <View className="m-4">
        <Button variant="primary" onPress={() => router.push("/fiscal/autuacoes")}>
          <Button.TextButton title="Cadastrar Autuação" />
        </Button>
      </View>
      <Modal
        className="bg-gray-200"
        variant="primary"
        visible={modal === MODAL.OPTIONS}
        onClose={() => setModal(MODAL.NONE)}
      >
        <View className="flex-1 justify-center">
          <View className="gap-5">
            <Button variant="primary" onPress={() => handleSendAutuacao()}>
              <Button.TextButton title="Enviar" />
            </Button>
            <Button variant="primary" onPress={() => handleDeleteAutuacao()}>
              <Button.TextButton title="Excluir" />
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}