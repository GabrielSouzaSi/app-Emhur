import React, { useState } from "react";
import { Text, TouchableOpacity, FlatList, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Item = {
  label: string;
  value: string;
};

type DropdownButtonProps = {
  data: Item[];
  onSelect: (data: Item) => void;
  placeholder?: string;
};

const DropdownButton: React.FC<DropdownButtonProps> = ({
  data,
  onSelect,
  placeholder = "Selecione uma opção",
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleSelect = (item: Item) => {
    setSelectedValue(item.label);
    onSelect(item);
    setIsDropdownVisible(false);
  };

  return (
    <View className="gap-4 mb-4">
      <TouchableOpacity
        className="flex-row justify-between items-center h-16 border-gray-400 border-2 bg-white rounded-md px-4"
        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <Text className="font-semiBold text-lg">
          {selectedValue ? selectedValue : placeholder}
        </Text>
        <Ionicons
          name={isDropdownVisible ? "chevron-up" : "chevron-down"}
          size={20}
          color="black"
        />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
          <FlatList
            data={data}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-blue-500 rounded-md p-2 my-2"
                onPress={() => handleSelect(item)}
              >
                <Text className="text-lg font-semiBold text-white">
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            horizontal={false}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};
export { DropdownButton };
