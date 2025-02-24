import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

type Historico = {
  data: string;
  status: string;
  vehicle: string;
};

type DataTableProps = {
  data: Historico[];
  onEdit?: (item: any) => void;
  on?: (item: any) => void;
  onSend: (item: any) => void;
};

const DataTableOff: React.FC<DataTableProps> = ({ data, onEdit, onSend }) => {
  const convertDate = (dateString: string): string => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <View className="flex-1 m-4 border-2 border-gray-300 rounded-md">
      {/* Cabeçalho da Tabela */}
      <View className="flex flex-row py-2 px-3 bg-white">
        <View className="flex-1">
          <Text className="text-gray-500 font-regular text-lg font-bold">
            Veículo
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 font-regular text-lg font-bold">
            Data
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 font-regular text-lg font-bold">
            Status
          </Text>
        </View>
        <View className="flex">
          <Text className="text-gray-500 font-regular text-lg font-bold">
            Ações
          </Text>
        </View>
      </View>

      {/* Linhas de Dados */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {data.map((item, index) => (
          <View
            className="flex-row border-b py-2 px-3 border-gray-400"
            key={index}
          >
            <View className="flex-1">
              <Text>{item.vehicle}</Text>
            </View>
            <View className="flex-1">
              <Text>{item.data}</Text>
            </View>
            <View className="flex-1">
              <Text>{item.status}</Text>
            </View>
            <View className="flex">
              <TouchableOpacity onPress={() => onSend(item)}>
                <MaterialCommunityIcons
                  name="cog"
                  size={24}
                  color={colors.blue[400]}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default DataTableOff;
