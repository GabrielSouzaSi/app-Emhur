import { useCallback, useState, useEffect, useContext } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Alert, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { HeaderBack } from "@/components/headerBack";
import { Button } from "@/components/button";
import DataTable from "@/components/dataTable";
import DataTableOff from "@/components/dataTableOff";
import { useAuth } from "@/hooks/useAuth";
import { server } from "@/server/api";
import { Loading } from "@/components/loading";
import { Modal } from "@/components/modal";
import { delDatabaseViolationId, getDatabaseViolations } from "@/database/violation";
import { NetworkContext } from "@/contexts/NetworkContext";

enum MODAL {
  NONE = 0,
  OPTIONS = 1,
}

export default function HistoricoAutuacoes() {
  const { isConnect } = useContext(NetworkContext);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [modal, setModal] = useState(MODAL.NONE);
  const { user } = useAuth();
  const [violations, setViolations] = useState<any>();
  const [autuacoes, setAutuacoes] = useState([]);
  const [dBAutuacao, setDBAutuacao] = useState<any>();


  const router = useRouter();

  // Função para visualizar a autuação selecionada
  const handleEdit = (item: any) => {
    router.push(`/fiscal/${item}`);
  };
  // Abre o modal para exibir as opções da autuação selecionada
  const handleOption = (item: any) => {
    console.log(item);

    setDBAutuacao(item);
    setModal(MODAL.OPTIONS);
  };
  // Envia a autuação pendênte
  const sendViolationSelected = async () => {
    setModal(MODAL.NONE);
    setIsLoaded(true)
    let currentdate = new Date();
    let time = `${currentdate.getHours()}${currentdate.getMinutes()}${currentdate.getSeconds()}`
    try {
      const { data } = await server.get(`/vehicle/${dBAutuacao.vehicle}`);
      const formData = new FormData();
      formData.append("auto_number", time.toString());
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
      await delDatabaseViolationId(dBAutuacao.id);
      Alert.alert("Sucesso", "Autuação enviado com sucesso!");
      fetchViolations();
      // Função para trazer os dados da tabela autuacoes
      const response = await getDatabaseViolations();
      setAutuacoes(response);
    } catch (error) {
      Alert.alert("Algo deu errado!", "Tente novamente!");
    } finally {
      setIsLoaded(false)
    }
  };
  // Deleta a autuação selecionada no banco
  const delViolationSelected = async () => {
    setModal(MODAL.NONE)
    setIsLoaded(true)
    try {
      await delDatabaseViolationId(dBAutuacao.id)
      await getViolations();
      Alert.alert("Aviso!", "Autuação excluída com sucesso!");
    } catch (error) {
      Alert.alert("Algo deu errado!", "Tente novamente!");
    } finally {
      setIsLoaded(false)
    }
  };
  // Função para receber as autuações do fiscal logado
  async function fetchViolations() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/agent/${user.id}/violations`);

      setViolations(data.violations);
    } catch (error) {
      throw error;
    } finally {
      // Consulta as autuações no bando
      const response = await getDatabaseViolations();
      setAutuacoes(response);
      setIsLoaded(false);
    }
  }
  // Função para buscar as autuações no banco
  async function getViolations() {
    setIsLoaded(true);
    try {
      // Consulta as autuações no bando
      const response = await getDatabaseViolations();
      setAutuacoes(response);
    } catch (error) {
      setIsLoaded(false);
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true); // Está focado.
      return () => {
        setIsFocused(false); // Não está focado.
      };
    }, [])
  );
  // Verifica a conexão
  useEffect(() => {
    isConnect && isFocused ? fetchViolations() : getViolations()
  }, [isConnect, isFocused])

  return (
    <View className="flex-1">
      <HeaderBack title="Histórico de Autuações" variant="primary" />

      <View className="m-4">
        <MaterialCommunityIcons
          name="circle"
          size={24}
          color={isConnect ? "green" : "red"}
        />
      </View>
      {autuacoes[0] ? (
        <View className="mx-4">
          <Text className="text-gray-500 font-regular text-2xl font-bold">
            Autuações Pendentes ({autuacoes.length}):
          </Text>
        </View>
      ) : (
        <View className="mx-4 mb-4 bg-white border-2 rounded-md border-gray-300">
          <View className="border-b-2 border-gray-300">
            <Text className="ml-2 my-2 text-gray-500 font-regular text-2xl font-bold">
              Aviso!
            </Text>
          </View>
          <View className="justify-center items-center">
            <Text className="my-4 text-gray-500 font-regular text-base font-bold">
              Sem pendência local.
            </Text>
          </View>
        </View>
      )}

      {autuacoes[0] ? (
        <DataTableOff data={autuacoes} onSend={handleOption} />
      ) : (
        <></>
      )}
      {violations && isConnect ? (
        <View className="mx-4">
          <Text className="text-gray-500 font-regular text-2xl font-bold">
            Autuações Enviadas ({violations.length}):
          </Text>
        </View>
      ) : (
        <></>
      )}
      {violations && isConnect ? <DataTable data={violations} onEdit={handleEdit} /> : <></>}

      <View className="m-4">
        <Button variant="primary" onPress={() => router.push("/fiscal/violation")}>
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
            <Button variant="primary" onPress={() => sendViolationSelected()}>
              <Button.TextButton title="Enviar" />
            </Button>
            <Button variant="primary" onPress={() => delViolationSelected()}>
              <Button.TextButton title="Excluir" />
            </Button>
          </View>
        </View>
      </Modal>
      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}