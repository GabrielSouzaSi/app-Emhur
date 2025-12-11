import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";

type judgementStatus = {
  id: number;
  name: string;
};

type Historico = {
  id: 1;
  auto_number: string;
  permit_holder_id: number;
  vehicle_id: number;
  user_id: number;
  violation_code_id: number;
  approach_id: number;
  judgement_status_id: null;
  penalty_type_id: null;
  violation_date: string;
  violation_time: string;
  address: string;
  description: string;
  justification_penalty: null;
  appeal_end_date: string;
  inspection_location_id: number;
  inspection_reason_id: number;
  inspection_date: string;
  inspection_result: string;
  judgement_status: judgementStatus | null;
};

type DataTableProps = {
  data: Historico[];
  type: "violation" | "inspection";
  onEdit: (item: any) => void;
};

const DataTable: React.FC<DataTableProps> = ({ data, type, onEdit }) => {
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
            Número
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
              <Text>{item.auto_number}</Text>
            </View>
            <View className="flex-1">
              <Text>
                {item.violation_date
                  ? convertDate(item.violation_date)
                  : convertDate(item.inspection_date)}
              </Text>
            </View>
            <View className="flex-1">
              <Text>
                {type === "violation"
                  ? item.judgement_status === null
                    ? "Criado"
                    : item.judgement_status.name
                  : item.inspection_result}
              </Text>
            </View>
            <View className="flex">
              <TouchableOpacity onPress={() => onEdit(item.id)}>
                <MaterialCommunityIcons
                  name="eye-outline"
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

export default DataTable;
