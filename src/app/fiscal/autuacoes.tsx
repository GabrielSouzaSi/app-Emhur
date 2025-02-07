import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
  Modal as RNModal,
} from "react-native";
import * as Location from "expo-location";

import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

import { CameraView, useCameraPermissions } from "expo-camera";

import * as autuacaoSchema from "@/database/schemas/autuacaoSchema";
import * as infracaoSchema from "@/database/schemas/infracaoSchema";
import * as approachSchema from "@/database/schemas/approachSchema";

import { HeaderBack } from "@/components/headerBack";
import { Field } from "@/components/input";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";
import { Data } from "@/dtos/autuacaoDTO";
import { server } from "@/server/api";
import { Loading } from "@/components/loading";
import { useAuth } from "@/hooks/useAuth";
import { VehicleDTO } from "@/dtos/vehicleDTO";
import { PermitHolderDTO } from "@/dtos/permitHolderDTO";
import { DropdownButton } from "@/components/buttonDropdown";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { checkInternetConnection } from "@/utils/networkStatus";

enum MODAL {
  NONE = 0,
  IMAGENS = 1,
  INFRACAO = 2,
  QR = 3,
  QRCODE = 4,
}
type ListCod = {
  id: number;
  description: string;
};

type Option = {
  id: number;
  name: string;
};

type LatLong = {
  latitude: number;
  longitude: number;
};

export default function Autuacaoes() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const isPermissionGranted = Boolean(permission?.granted);

  const [isFocused, setIsFocused] = useState(false);
  const [isConnected, setIsConnected] = useState<any>();

  // informação do usuário
  const { user } = useAuth();
  const [load, setLoad] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const database = useSQLiteContext();
  const dbAutuacoes = drizzle(database, { schema: autuacaoSchema });
  const dbInfracoes = drizzle(database, { schema: infracaoSchema });
  const dbApproach = drizzle(database, { schema: approachSchema });

  const [codeQr, setCodeQr] = useState("");

  const [autuacao, setAutuacao] = useState<Data[]>([]);
  const router = useRouter();

  // Mode de Abordagem
  const [approach, setApproach] = useState<any>([]);
  const [abordagem, setAbordagem] = useState<number>();

  const qrCodeLock = useRef(false);

  // Informações do Veiculo
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [numero, setNumero] = useState("");

  const [imagens, setImagens] = useState<ImagePicker.ImagePickerResult[] | any>(
    []
  );
  const [imagensOff, setImagensOff] = useState<string[]>([]);

  // Localização do usuário
  const [location, setLocation] = useState<LatLong>();
  // Condutor
  const [condutor, setCondutor] = useState<any>(false);

  // Dados da Infração
  const [local, setLocal] = useState("");
  const [idInfracao, setIdInfracao] = useState<number>();
  const [textCod, setTextCod] = useState("");
  const [obs, setObs] = useState("");

  // Dados do Condutor/Infrator
  const [permitHolder, setPermitHolder] = useState<PermitHolderDTO>();

  // Modal
  const [modal, setModal] = useState(MODAL.NONE);

  // Recebe a lista de códigos
  const [codigo, setCodigo] = useState<ListCod[]>([]);
  const [selecText, setSelecText] = useState<ListCod[]>([]);

  async function searchPlate(req: any) {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/vehicle/${req}`);

      const { permit_holder_id, vehicle_id } = data;
      setLoad(true);
      setVehicle(vehicle_id);
      setPermitHolder(permit_holder_id);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  async function getQrCode(code: string) {
    console.log(code);
    try {
      setIsLoaded(true);
      const { data } = await server.get(`validation/${code}`);
      setCondutor(data.holder);

      setModal(MODAL.NONE);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  async function qrCode(data: string) {
    console.log(data);
    setModal(MODAL.NONE);
    qrCodeLock.current = false;
    try {
      setIsLoaded(true);
      const { data } = await server.get(`appeals/1`);
      setCondutor(data);
      setModal(MODAL.QRCODE);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  // Função executada quando o código de barras é escaneado
  const handleBarCodeScanned = (data: string) => {
    Alert.alert("Aviso!", `Código de barras escaneado.\nDados: ${data}`, [
      {
        text: "Cancelar",
        onPress: () => {
          (qrCodeLock.current = false), setModal(MODAL.NONE);
        },
        style: "cancel",
      },
      { text: "OK", onPress: () => qrCode(data) },
    ]);
  };

  // Função para trazer os dados da tabela infracoes
  async function fetchInfracoes() {
    try {
      const response = await dbInfracoes.query.infracao.findMany();

      console.log("response dbInfracoes => ", response);
      let cod = await response.map((item: any) => {
        return {
          id: item.id,
          description: `${item.code}: ${item.description}`,
        };
      });
      setCodigo(cod);
      setSelecText(cod);
    } catch (error) {
      console.log("fetchInfracoes =>" + error);
    } finally {
      setIsLoaded(false);
    }
  }
  // Função para trazer os dados da tabela approach
  async function fetchAutuacao() {
    try {
      const response = await dbAutuacoes.query.autuacao.findMany();

      console.log("autuacao => ", response);
    } catch (error) {
      console.log("fetchAutuacao error =>" + error);
    }
  }
  // Função para trazer os dados da tabela approach
  async function fetchApproach() {
    try {
      const response = await dbApproach.query.approach.findMany();

      console.log("dbApproach => ", response);

      let optionApproach = response.map((data: any) => {
        return {
          label: data.name,
          value: data.id,
        };
      });

      setApproach(optionApproach);
    } catch (error) {
      console.log("fetchInfracoes error =>" + error);
    }
  }

  async function getViolationCode() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/vehicle/1`);
      const { approach } = data;
      console.log(approach);

      let optionApproach = approach.map((data: any) => {
        return {
          label: data.name,
          value: data.id,
        };
      });

      setApproach(optionApproach);
      const { violationCode } = data;
      let cod = await violationCode.map((item: any) => {
        return {
          id: item.id,
          description: `${item.code}: ${item.description}`,
        };
      });
      setCodigo(cod);
      setSelecText(cod);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  async function postAutuacoa() {
    let gps = await getStatusGPS();
    let lat, long;

    if (gps) {
      let result = await Location.getCurrentPositionAsync();
      lat = result.coords.latitude;
      long = result.coords.longitude;
    } else {
      return;
    }
    let currentdate = new Date();
    let date =
      +currentdate.getFullYear() +
      "-" +
      (currentdate.getMonth() + 1) +
      "-" +
      currentdate.getDate();

    let time =
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    const formData = new FormData();
    formData.append("auto_number", `auto_number`);
    formData.append("permit_holder_id", `${permitHolder?.id}`);
    formData.append("user_id", `${user.id}`);
    formData.append("vehicle_id", `${vehicle?.id}`);
    formData.append("approach_id", `${abordagem}`);
    formData.append("violation_code_id", `${idInfracao}`);
    formData.append("violation_date", date);
    formData.append("violation_time", time);
    formData.append("latitude", `${lat}`);
    formData.append("longitude", `${long}`);
    formData.append("address", local);
    formData.append("description", obs);
    imagens.forEach((image: any, index: number) => {
      formData.append("attachments[]", {
        ...image,
        uri: image.uri,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });
    formData.append("appeal_end_date", "2024-08-26");
    console.log(formData);

    try {
      setIsLoaded(true);
      await server.postForm(`/violations`, formData);
      Alert.alert("Sucesso", "Autuação enviado com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Algo deu errado!", "Tente novamente!");
      console.log(error);
    } finally {
      setIsLoaded(false);
    }
  }
  async function addAutuacao() {
    let gps = await getStatusGPS();
    let lat, long;

    if (gps) {
      let result = await Location.getCurrentPositionAsync();
      lat = result.coords.latitude;
      long = result.coords.longitude;
    } else {
      Alert.alert("Erro!", "Não foi possível acessar sua localização.", [
        {text: "Cancelar", style:"cancel"},
        {text: "Tente Novamente", onPress: () => addAutuacao() },
      ]);
      return;
    }
    let currentdate = new Date();
    let date =
      +currentdate.getFullYear() +
      "-" +
      (currentdate.getMonth() + 1) +
      "-" +
      currentdate.getDate();

    let time =
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    const data = [
      {
        vehicle: numero, // placa ou numero
        imagens: imagensOff,
        local: local,
        latitude: lat.toString(),
        longitude: long.toString(),
        data: date,
        hora: time,
        approach: abordagem,
        idInfracao: idInfracao,
        obs: obs,
        status: "Pendente",
      },
    ];
    console.log(data);

    try {
      const response = await dbAutuacoes
        .insert(autuacaoSchema.autuacao)
        .values(data)
        .run();

      console.log(response);
      Alert.alert("Sucesso", "Autuação salva com sucesso!", [
        { text: "OK", onPress: () => {} },
      ]);
    } catch (error) {
      Alert.alert("Algo deu errado!", "Tente novamente!");
      console.log(error);
    }
  }

  async function deleteDataAutuacao() {
    try {
      const response = await dbAutuacoes.delete(autuacaoSchema.autuacao).run();

      console.log(response);
      fetchAutuacao();
    } catch (error) {
      console.log(error);
    }
  }

  // filtra a pesquisa do usuário
  function filter(text: string) {
    if (text) {
      let filtered = codigo?.filter((item: ListCod) =>
        item.description.includes(text)
      );
      if (filtered.length == 0) {
        setSelecText([{ id: 1000, description: "Sem resultados!" }]);
        return;
      }

      setSelecText(filtered); // valor filtrado
    } else {
      setSelecText(codigo); // Valor original
    }
  }

  // Função para preparar o componente RadioButton
  const onSelectMode = (item: any) => {
    setAbordagem(item.value);
    console.log("Selected Option ID:", item.value);
  };

  // Função recebe o código da infração selecionada
  function onSelectData(item: ListCod) {
    setTextCod(item.description);
    setIdInfracao(item.id);
    setModal(MODAL.NONE);
  }

  // Função para ter acesso a galeria de imagens
  const askPermission = async () => {
    let rest = MediaLibrary.requestPermissionsAsync();
    console.log(rest);
  };

  // Funação para ter acesso a camera
  const askCameraPermission = async () => {
    // Solicitar permissão para usar a câmera
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();

    if (cameraStatus !== "granted") {
      alert(
        "Desculpe, precisamos das permissões da câmera e do álbum para isso funcionar!"
      );
      return;
    }
  };

  // Função para tirar foto
  const takePhoto = async () => {
    await askCameraPermission();
    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      let img = {
        uri: pickerResult.assets[0].uri,
        name: new Date().getTime() + ".jpeg",
        type: "image/jpeg",
      };
      setImagens([...imagens, img]);
      saveImage(img.uri);
    }
  };
  // Salva a foto na galeria
  const saveImage = async (uri: string) => {
    // Solicitar permissão para gerenciar mídia
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para salvar a imagem."
      );
      return;
    }
    try {
      // Salvar a imagem no álbum específico
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Verificar se o álbum já existe
      let album = await MediaLibrary.getAlbumAsync("EmhurFiscal");

      if (!album) {
        album = await MediaLibrary.createAlbumAsync(
          "EmhurFiscal",
          asset,
          false
        );
        alert("Imagem salva com sucesso!");
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      }
      // Buscar as fotos do álbum
      const { assets } = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: "photo",
      });
      // console.log(assets);

      let img = assets.filter((item) => item.filename === asset.filename);

      console.log(img[0].uri);
      setImagensOff([...imagensOff, img[0].uri]);
    } catch (error) {
      console.log(error);
      alert("Erro ao salvar a imagem!");
    }
  };

  // Função para selecinar imagem da galeria
  const pickImage = async () => {
    // Solicitar permissão para acessar a mídia
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de permissão para acessar sua biblioteca de mídia."
      );
      return;
    }

    // Abrir seletor de imagem
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      let img = {
        uri: pickerResult.assets[0].uri,
        name: new Date().getTime() + ".jpeg",
        type: "image/jpeg",
      };
      setImagens([...imagens, img]);
      setImagensOff([...imagensOff, img.uri]);
    }
  };

  // Função para remover imagem
  const removerImagem = (index: number) => {
    if (isConnected) {
      let upImagens = [...imagens.slice(0, index), ...imagens.slice(index + 1)];
      setImagens(upImagens);
    } else {
      let upImagensOff = [
        ...imagensOff.slice(0, index),
        ...imagensOff.slice(index + 1),
      ];
      setImagensOff(upImagensOff);
    }

    if (imagens.length < 1) setModal(MODAL.NONE);
  };

  // pega o resultado da permissão fornecido pelo usuaáio
  const checkGpsStatus = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    console.log(granted);

    // verifica se a permissão não foi concedida
    if (!granted) {
      Alert.alert("Aviso!", `Permita o acesso ao GPS.`, [{ text: "OK" }]);
      checkGpsStatus();
    }
    getStatusGPS();
  };

  async function getStatusGPS() {
    // Verifica se o GPS está ativo
    const providerStatus = await Location.getProviderStatusAsync();

    if (!providerStatus.gpsAvailable) {
      Alert.alert("Aviso!", `Ative o GPS.`, [
        { text: "OK", onPress: () => getStatusGPS() },
      ]);
    }
    return providerStatus.gpsAvailable;
  }

  //função checkInternetConnection para verificar o status de conexão
  const checkConnection = async () => {
    const connected = await checkInternetConnection();
    setIsConnected(connected);
  };
  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    fetchApproach();
    fetchInfracoes();
  }, []);

  useEffect(() => {
    checkGpsStatus();
  }, []);

  useEffect(() => {
    (async () => {
      if (!permission) {
        const { granted } = await requestPermission();
        setHasPermission(granted);
      } else {
        setHasPermission(permission.granted);
      }
    })();
  }, [permission]);

  return (
    <>
      <View className="flex-1">
        {/* Cabeçalho */}
        <HeaderBack title="Cadastrar Autuação" variant="primary" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="flex p-4">
            {/* Numero da infração */}
            <View className="flex-row items-center mb-5">
              <View className="flex-1">
                <Field
                  variant="primary"
                  placeholder="placa ou número"
                  onChangeText={setNumero}
                  onSubmitEditing={() => searchPlate(numero)}
                  returnKeyType="send"
                />
              </View>
            </View>

            <Button
              className="mb-4"
              variant="primary"
              onPress={() => setModal(MODAL.QR)}
            >
              <Button.TextButton title="QR CODE" />
            </Button>
            {/* Veiculo */}
            {vehicle?.id ? (
              <View>
                <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
                  Informações do Veículo:
                </Text>
                <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Placa:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {vehicle.plate_number}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Marca:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {vehicle.make}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Modelo:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {vehicle.model}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Cor:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {vehicle.color}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Ano:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {vehicle.year}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Renavam:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {vehicle.renavam.slice(0, 3)}*****
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <></>
            )}

            {/* Dados do Condutor */}
            {permitHolder?.id ? (
              <View className="flex">
                <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
                  Dados do Permissionário:
                </Text>
                <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Nome:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {permitHolder.name}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        CPF:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {permitHolder.cpf.slice(0, 3)}*****
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        CNH:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {permitHolder.cnh.slice(0, 3)}*****
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <></>
            )}

            {/* Dados do Condutor */}
            {condutor.attorney_id ? (
              <View className="flex">
                <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
                  Dados do Condutor:
                </Text>
                <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Nome:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.name}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        CPF:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.cpf}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        VALIDADE CNH:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.validade_cnh}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Categoria:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.categoria}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        CNH:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.cnh}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <></>
            )}

            {/* Modo de abordagem */}
            {approach.length ? (
              <>
                <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
                  Modo de abordagem:
                </Text>
                <DropdownButton
                  data={approach}
                  onSelect={onSelectMode}
                  placeholder="Modo de abordagem"
                />
              </>
            ) : (
              <></>
            )}

            {/* Imagens do Veiculo */}
            <View className="flex flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Button variant="primary" onPress={() => takePhoto()}>
                  <Button.TextButton title="Tirar foto" />
                </Button>
              </View>
              <View className="flex-1 ml-2">
                <Button variant="primary" onPress={() => pickImage()}>
                  <Button.TextButton title="Abrir galeria" />
                </Button>
              </View>
            </View>

            {/* Se houver imagem */}
            {isConnected && imagens.length > 0 ? (
              <Button variant="primary" onPress={() => setModal(MODAL.IMAGENS)}>
                <Button.TextButton title={`Imagens(${imagens.length})`} />
              </Button>
            ) : (
              <></>
            )}
            {!isConnected && imagensOff.length > 0 ? (
              <Button variant="primary" onPress={() => setModal(MODAL.IMAGENS)}>
                <Button.TextButton title={`Imagens(${imagensOff.length})`} />
              </Button>
            ) : (
              <></>
            )}

            {/* Dados da Infração */}
            <View className="flex">
              <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
                Dados da Infração:
              </Text>
              <Field
                placeholder="Local"
                variant="primary"
                onChangeText={setLocal}
                value={local}
              />
              <Button
                className="mt-4"
                variant="primary"
                onPress={() => setModal(MODAL.INFRACAO)}
              >
                <Button.TextButton title="Código da Infração" />
              </Button>
              {textCod ? (
                <View className="bg-gray-300 rounded-md px-2 py-4 mt-4">
                  <Text className="font-medium text-lg">{textCod}</Text>
                </View>
              ) : (
                <></>
              )}
            </View>

            {/* Observação */}
            <View className="flex mb-5">
              <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
                Observação:
              </Text>
              <Field
                placeholder="Descreva o assunto."
                variant="primary"
                onChangeText={setObs}
                value={obs}
              />
            </View>

            {/* Salvar */}
            {isConnected ? (
              <Button variant="primary" onPress={() => postAutuacoa()}>
                <Button.TextButton title="SALVAR" />
              </Button>
            ) : (
              <View className="gap-4">
                <Button variant="primary" onPress={() => addAutuacao()}>
                  <Button.TextButton title="SALVAR OFFLINE" />
                </Button>
                <Button variant="primary" onPress={() => deleteDataAutuacao()}>
                  <Button.TextButton title="DELETAR AUTUAÇÕES" />
                </Button>
              </View>
            )}
          </View>
        </ScrollView>
        <Modal
          className="bg-gray-200"
          variant="primary"
          visible={modal === MODAL.IMAGENS}
          onClose={() => setModal(MODAL.NONE)}
        >
          <View className="flex-1">
            <FlatList
              data={isConnected ? imagens : imagensOff}
              renderItem={({ item, index }) => (
                <View className="w-full mb-4 bg-white p-2 rounded-md border-gray-300 border-2">
                  {isConnected ? (
                    <Image
                      className="h-56 rounded-md"
                      source={{ uri: item.uri }}
                    />
                  ) : (
                    <Image className="h-56 rounded-md" source={{ uri: item }} />
                  )}
                  <Pressable
                    className="py-4 items-center"
                    onPress={() => removerImagem(index)}
                  >
                    <Text className="text-red-500 font-semiBold text-lg">
                      Excluir
                    </Text>
                  </Pressable>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Modal>
        <Modal
          variant="primary"
          visible={modal === MODAL.INFRACAO}
          onClose={() => setModal(MODAL.NONE)}
        >
          <Field
            className="mb-4"
            placeholder="Código da Infração"
            variant="primary"
            onChangeText={(text) => filter(text)}
          />
          <FlatList
            data={selecText}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-gray-300 rounded-md p-2 my-4"
                onPress={() => onSelectData(item)}
              >
                <Text className="text-lg font-medium">{item.description}</Text>
              </TouchableOpacity>
            )}
            horizontal={false}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
          />
        </Modal>
        <RNModal visible={modal === MODAL.QR} className="flex-1">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => {
              if (data && !qrCodeLock.current) {
                qrCodeLock.current = true;
                setTimeout(() => handleBarCodeScanned(data), 500);
              }
            }}
          />
          <View className="absolute top-5 right-4 z-50">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setModal(MODAL.NONE)}
            >
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={30}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </RNModal>
        <Modal
          variant="primary"
          visible={modal === MODAL.QRCODE}
          onClose={() => setModal(MODAL.NONE)}
        >
          <Field
            className="mb-4"
            placeholder="Código"
            variant="primary"
            onChangeText={setCodeQr}
            onSubmitEditing={() => getQrCode(codeQr)}
            returnKeyType="send"
          />
        </Modal>
        {isLoaded ? <Loading /> : <></>}
      </View>
    </>
  );
}
