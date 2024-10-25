import { useEffect, useState, useRef } from "react";
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
} from "react-native";
import * as Location from "expo-location";

import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useSQLiteContext } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";

import { CameraView, useCameraPermissions } from "expo-camera";

import * as autuacaoSchema from "@/database/schemas/autuacaoSchema";

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

  // informação do usuário
  const { user } = useAuth();
  const [load, setLoad] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const database = useSQLiteContext();
  const db = drizzle(database, { schema: autuacaoSchema });

  const [codeQr, setCodeQr] = useState("");

  const [autuacao, setAutuacao] = useState<Data[]>([]);
  const router = useRouter();

  // Mode de Abordagem
  const [approach, setApproach] = useState([]);
  const [abordagem, setAbordagem] = useState<number>();

  const qrCodeLock = useRef(false);

  // Informações do Veiculo
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [numero, setNumero] = useState("");

  const [imagens, setImagens] = useState<ImagePicker.ImagePickerResult[] | any>(
    []
  );

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
      setCondutor(data.holder)

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

  async function getViolationCode() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/vehicle/1`);
      const { approach } = data;
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

  async function fetchAutuacoes() {
    try {
      const response = await db.query.autuacao.findMany();

      console.log(response);
      // setData(response);
    } catch (error) {
      console.log(error);
    }
  }

  async function addAutuacao() {
    try {
      const response = await db
        .insert(autuacaoSchema.autuacao)
        .values({ imagens });

      await fetchAutuacoes();
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
  const askPermission = async (failureMessage: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "denied") {
      alert(failureMessage);
    }
  };

  // Funação para ter acesso a camera
  const askCameraPermission = async () => {
    // Solicitar permissão para usar a câmera
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    // Solicitar permissão para salvar a imagem no álbum
    const { status: mediaLibraryStatus } =
      await MediaLibrary.requestPermissionsAsync();
    if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
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
    }
  };

  // Recupera as informações do album "EmhurFiscal"
  async function getAlbum() {
    let album = await MediaLibrary.getAlbumAsync("EmhurFiscal");
    console.log("Album => ", album);
    // obtendo as mídias conti
  }

  // Salva a foto na galeria
  const saveImage = async (uri: any) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("EmhurFiscal", asset, false);
      alert("Imagem salva com sucesso!");
    } catch (error) {
      console.log(error);
      alert("Erro ao salvar a imagem!");
    }
  };

  // Função para selecinar imagem da galeria
  const pickImage = async () => {
    await askPermission(
      "Precisamos da permissão do rolo da câmera para ler as fotos do seu telefone..."
    );

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2],
      quality: 1,
    });
    // console.log(pickerResult);

    if (!pickerResult.canceled) {
      let img = {
        uri: pickerResult.assets[0].uri,
        name: new Date().getTime() + ".jpeg",
        type: "image/jpeg",
      };
      setImagens([...imagens, img]);
    }
  };

  // Função para remover imagem
  const removerImagem = (index: number) => {
    let upImagens = [...imagens.slice(0, index), ...imagens.slice(index + 1)];

    setImagens(upImagens);

    if (imagens.length <= 1) setModal(MODAL.NONE);
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
  useEffect(() => {
    getViolationCode();
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
              <Button.TextButton title="QR" />
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
            {imagens.length ? (
              <Button variant="primary" onPress={() => setModal(MODAL.IMAGENS)}>
                <Button.TextButton title={`Imagens(${imagens.length})`} />
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
            <Button variant="primary" onPress={() => postAutuacoa()}>
              <Button.TextButton title="SALVAR" />
            </Button>
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
              data={imagens}
              renderItem={({ item, index }) => (
                <View className="w-full mb-4 bg-white p-2 rounded-md border-gray-300 border-2">
                  <Image
                    className="h-56 rounded-md"
                    source={{ uri: item.uri }}
                  />
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
        <Modal
          variant="primary"
          visible={modal === MODAL.QR}
          onClose={() => setModal(MODAL.NONE)}
        >
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
        </Modal>
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
