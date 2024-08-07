import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import RadioGroup, { RadioButtonProps } from "react-native-radio-buttons-group";
import { HeaderBack } from "@/components/headerBack";
import { Field } from "@/components/input";
import { Button } from "@/components/button";
import { Modal } from "@/components/modal";

const DATA = [
  { id: "1", codigo: "101: Abandonar o veículo quando em serviço." },
  {
    id: "2",
    codigo:
      "102: Apresentar-se ao trabalho sem uniforme adequado e sem condições de passeio, ou dirigir com camisa aberta, de sandálias, chinelos, boné, chapéu e/ou demais adereços sobre a cabeça.",
  },
  {
    id: "3",
    codigo:
      "103: Ligar ou desligar o rádio sem prévio consentimento do passageiro.",
  },
  { id: "4", codigo: "104: Fumar ao dirigir o veículo." },
  { id: "5", codigo: "105: Trafegar com excesso de lotação." },
  { id: "6", codigo: "106: Não informar a mudança de endereço à EMHUR." },
  {
    id: "7",
    codigo: "107: Não apresentar informações solicitadas pela EMHUR.",
  },
  {
    id: "8",
    codigo:
      "108: Circular com o sistema de sinalização do veículo com defeito.",
  },
  {
    id: "9",
    codigo:
      "109: Circular sem limpador de para-brisa ou com este apresentando defeito.",
  },
  {
    id: "10",
    codigo:
      "201: Transportar sem urbanidade o usuário ou recusar-se a acomodar, transportar ou retirar do porta-malas a bagagem do passageiro.",
  },
  { id: "11", codigo: "202: Alterar o valor da tarifa." },
  { id: "12", codigo: "203: Proferir palavrões ou fazer gestos obscenos." },
  {
    id: "13",
    codigo:
      "204: Não atender o sinal de parada para o embarque ou desembarque de passageiros.",
  },
  {
    id: "14",
    codigo:
      "205: Permitir o embarque ou desembarque do passageiro com o veículo em movimento.",
  },
  {
    id: "15",
    codigo:
      "206: Transportar objetos que dificultem a acomodação do passageiro ou de sua bagagem.",
  },
  { id: "16", codigo: "301: Desrespeitar a vez nos pontos de táxi." },
  {
    id: "17",
    codigo: "302: Circular sem retrovisores externos ou com estes quebrados.",
  },
  {
    id: "18",
    codigo:
      "303: Circular com janelas ou portas defeituosas ou quebradas (vidros).",
  },
  {
    id: "19",
    codigo:
      "304: Circular sem bancos, ou com estes quebrados, rasgados ou soltos.",
  },
  { id: "20", codigo: "305: Portar publicidade sem autorização da EMHUR." },
  {
    id: "21",
    codigo:
      "306: Não comparecer ao local do ponto saída/entrada indicado pela EMHUR ou circulando sem cumprir o itinerário completo (táxi-lotação).",
  },
  { id: "22", codigo: "307: Transitar sem velocímetro ou com este quebrado." },
  { id: "23", codigo: "308: Transitar sem faróis ou com estes queimados." },
  { id: "24", codigo: "309: Deixar de atender com presteza o passageiro." },
  {
    id: "25",
    codigo:
      "310: Embarcar e/ou desembarcar em local não permitido (apanhar passageiro em local de parada proibida).",
  },
  {
    id: "26",
    codigo:
      "401: Não utilizar no veículo o padrão determinado pela EMHUR ou por qualquer ato normativo do Chefe do Executivo Municipal.",
  },
  {
    id: "27",
    codigo:
      "402: Não cumprir itinerário estabelecidos pela EMHUR (no caso de táxi lotação)",
  },
  {
    id: "28",
    codigo: "403: Trafegar com veículo em más condições de limpeza e higiene.",
  },
  {
    id: "29",
    codigo:
      "404: Trafegar com veículo com uso de película (insulfilme) nos vidros laterais e para-brisa dianteiros e traseiros em grau não permitido pelo CTB (sem prejuízo da retirada do acessório).",
  },
  { id: "30", codigo: "405: Transitar com pneus lisos (carecas)." },
  {
    id: "31",
    codigo: "406: Transitar com veículo com deficiência nos freios.",
  },
  {
    id: "32",
    codigo:
      "407: Transportar passageiros fora do horário estabelecido (no caso de táxi lotação).",
  },
  {
    id: "33",
    codigo:
      "501: Transitar com veículo derramando na via pública, combustível ou lubrificante.",
  },
  {
    id: "34",
    codigo:
      "502: Não apresentar o veículo para vistoria, quando requisitado pela EMHUR.",
  },
  { id: "35", codigo: "503: Trafegar com para-brisa quebrado." },
  { id: "36", codigo: "504: Não portar documentos de uso obrigatório." },
  {
    id: "37",
    codigo:
      "505: Exercer ao dirigir qualquer atividade que seja proibida pelas normais legais ou que possam desviar a atenção no trânsito (uso de aparelho celular, aparelho eletrônico e demais atividades que ocupem uma ou ambas as mãos).",
  },
  { id: "38", codigo: "601: Fornecer à EMHUR dados não verdadeiros." },
  {
    id: "39",
    codigo: "602: Transitar com veículo sem seguro exigido por lei.",
  },
  { id: "40", codigo: "603: Não portar extintor ou porta-lo descarregado." },
  {
    id: "41",
    codigo:
      "604: Transitar com veículo sem selo de vistoria ou com o selo de vistoria vencido.",
  },
  {
    id: "42",
    codigo:
      "605: Transitar com veículo sem nova vistoria, depois de reparado em consequência de acidente.",
  },
  {
    id: "43",
    codigo:
      "701: Escolher corridas ou recusar passageiros, salvo nos casos expressamente previstos.",
  },
  { id: "44", codigo: "702: Alongar o itinerário sem justificativa." },
  {
    id: "45",
    codigo:
      "703: Deixar de concluir a corrida, exigindo pagamento, no caso de interrupção do percurso, independentemente da vontade do passageiro.",
  },
  {
    id: "46",
    codigo:
      "704: Recusar-se a apresentar documentos ou evadir-se para não apresenta-los.",
  },
  {
    id: "47",
    codigo:
      "705: Usar veículo para prática de lotação sem estar devidamente autorizado.",
  },
  {
    id: "48",
    codigo:
      "706: Combinar preço para corrida dentro de Boa Vista, salvo nos casos previstos no Decreto de tarifa de táxi.",
  },
  {
    id: "49",
    codigo: "707: Usar o veículo para quaisquer outros fins não permitidos.",
  },
  {
    id: "50",
    codigo:
      "708: Deixar de colocar o táxi à disposição da autoridade fiscal ou de seus agentes credenciados para inspeção, aferição de taxímetro ou recolhimento do veículo.",
  },
  { id: "51", codigo: "709: Portar arma de qualquer espécie." },
  {
    id: "52",
    codigo: "710: Cobrar acima da tarifa oficial pelo transporte de volumes.",
  },
  {
    id: "53",
    codigo:
      "711: Apresentar documentos de porte obrigatório de maneira irregular",
  },
  {
    id: "54",
    codigo:
      "712: Permitir o trabalho de motorista portador de doença infectocontagiosa.",
  },
  {
    id: "55",
    codigo:
      "713: Deixar de apresentar qualquer dos documentos exigidos pela EMHUR ou pelo CTB.",
  },
  {
    id: "56",
    codigo: "714: Fazer ponto ou permanecer em local não permitido.",
  },
  {
    id: "57",
    codigo:
      "715: Alienar ou transferir permissão para exploração do serviço de Táxi sem autorização da EMHUR.",
  },
  {
    id: "58",
    codigo:
      "716: Operar com veículo já desativado pela EMHUR ou não autorizado.",
  },
  {
    id: "59",
    codigo:
      "717: Operar com veículo sem condições de tráfego, com risco para o passageiro.",
  },
  {
    id: "60",
    codigo: "718: Adulterar selo de vistoria ou credencial do condutor.",
  },
  { id: "61", codigo: "719: Entregar o veículo a motorista não habilitado." },
  { id: "62", codigo: "720: Ingerir bebida alcoólica durante o serviço." },
  {
    id: "63",
    codigo:
      "721: Agredir verbalmente ou fisicamente o fiscal da EMHUR quando em serviço ou qualquer autoridade do trânsito. Neste caso, pode deixar de ser aplicada multa e a permissão ser cassada sumariamente.",
  },
];

enum MODAL {
  NONE = 0,
  MODAL = 1,
}
type ListCod = {
  id: string;
  codigo: string;
};

export default function Autuacaoes() {
  const router = useRouter();
  // Mode de Abordagem
  const [selectedId, setSelectedId] = useState<string | undefined>();
  // Informações do Veiculo
  const [placa, setPlaca] = useState("");
  const [numeroVeiculo, setNumeroVeiculo] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [tipo, setTipo] = useState("");
  const [especie, setEspecie] = useState("");
  const [imagens, setImagens] = useState("");

  // Dados da Infração
  const [local, setlocal] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [infracaoSelecionada, setInfracaoSelecionada] = useState<ListCod>();
  const [textCod, setTextCod] = useState("");

  // Dados do Condutor/Infrator
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnhPermissao, setCnhPermissao] = useState("");
  const [uf, setUf] = useState("");

  // Modal
  const [modal, setModal] = useState(MODAL.NONE);

  const [codigo, setCodigo] = useState<ListCod[]>(DATA);
  const [selecText, setSelecText] = useState<ListCod[]>(DATA);
  // filtra a pesquisa do usuário
  function filter(text: string) {
    if (text) {
      let filtered = codigo?.filter((line: ListCod) =>
        line.codigo.includes(text)
      );
      if (filtered.length == 0) {
        setSelecText([{ id: "1000", codigo: "Sem resultados!" }]);
        return;
      }

      setSelecText(filtered); // valor filtrado
    } else {
      setSelecText(codigo); // Valor original
    }
  }

  const radioButtons: RadioButtonProps[] = useMemo(
    () => [
      {
        id: "1", // acts as primary key, should be unique and non-empty string
        label: "Com",
        value: "Com",
      },
      {
        id: "2",
        label: "Sem",
        value: "Sem",
      },
      {
        id: "3",
        label: "Estacionado",
        value: "Estacionado",
      },
    ],
    []
  );

  function onSelectData(item: ListCod) {
    setInfracaoSelecionada(item);
    setTextCod(item.codigo);
    setSelecText(codigo);
    setModal(MODAL.NONE);
  }
  return (
    <View>
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
              <Text className="text-gray-500 font-regular text-2xl font-bold">
                N° Auto de infração:
              </Text>
            </View>
            <View className="flex-1">
              <Field variant="primary" />
            </View>
          </View>

          {/* Modo de abordagem */}
          <View className="mb-6">
            <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
              Modo de abordagem:
            </Text>
            <RadioGroup
              radioButtons={radioButtons}
              onPress={setSelectedId}
              selectedId={selectedId}
              layout="row"
              containerStyle={{ justifyContent: "space-between" }}
              labelStyle={{ fontFamily: "Montserrat_400Regular", fontSize: 16 }}
            />
          </View>

          {/* Veiculo */}
          <View className="flex flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Field placeholder="Placa" variant="primary" />
            </View>
            <View className="flex-1 ml-2">
              <Field placeholder="N° Veículo" variant="primary" />
            </View>
          </View>

          <View className="flex flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Field placeholder="Marca" variant="primary" />
            </View>
            <View className="flex-1 ml-2">
              <Field placeholder="Modelo" variant="primary" />
            </View>
          </View>

          <View className="flex flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Field placeholder="Tipo" variant="primary" />
            </View>
            <View className="flex-1 ml-2">
              <Field placeholder="Especie" variant="primary" />
            </View>
          </View>

          {/* Imagens do Veiculo */}
          <Button variant="primary">
            <Button.TextButton title="Adicionar Imagens" />
          </Button>

          {/* Dados da Infração */}
          <View className="flex">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
              Dados da Infração:
            </Text>
            <Field placeholder="Local" variant="primary" />
            <View className="flex flex-row my-4">
              <View className="flex-1 mr-2">
                <Field placeholder="Data" variant="primary" />
              </View>
              <View className="flex-1 ml-2">
                <Field placeholder="Hora" variant="primary" />
              </View>
            </View>
            <Button variant="primary">
              <Button.TextButton
                title="Código da Infração"
                onPress={() => setModal(MODAL.MODAL)}
              />
            </Button>
            <Modal
              variant="primary"
              visible={modal === MODAL.MODAL}
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
                    <Text className="text-lg font-medium">{item.codigo}</Text>
                  </TouchableOpacity>
                )}
                horizontal={false}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
              />
            </Modal>
            {textCod ? (
              <View className="bg-gray-300 rounded-md px-2 py-4 mt-4">
                <Text className="font-medium text-lg">{textCod}</Text>
              </View>
            ) : (
              <></>
            )}
          </View>

          {/* Dados do Condutor/Infrator */}
          <View className="flex mb-5">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
              Dados do Condutor/Infrator:
            </Text>
            <Field placeholder="Nome" variant="primary" />
            <View className="flex flex-row my-4">
              <View className="flex-1 mr-2">
                <Field placeholder="CPF" variant="primary" />
              </View>
              <View className="flex-1 ml-2">
                <Field placeholder="N° CNH/Permissão" variant="primary" />
              </View>
            </View>
            <Field placeholder="UF" variant="primary" />
          </View>

          {/* Salvar */}
          <Button variant="primary">
            <Button.TextButton title="SALVAR" />
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
