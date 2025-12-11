import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, FlatList, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";

type Item = {
  label: string;
  value: string;
};

type DropdownButtonProps = {
  data: Item[];
  onSelect: (data: Item) => void;
  placeholder?: string;
  errorMessage?: string;
  value?: string | number | null; // ✅ novo: valor controlado vindo do form
};

const DropdownButton: React.FC<DropdownButtonProps> = ({
  data,
  onSelect,
  placeholder = "Selecione uma opção",
  errorMessage,
  value,
}) => {
  const [selectedValue, setSelectedLabel] = useState<string | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // ✅ Atualiza o label quando o valor mudar (ex: reset ou carregar dados)
  useEffect(() => {
    if (value != null) {
      const selectedItem = data.find((item) => item.value === value);
      setSelectedLabel(selectedItem ? selectedItem.label : null);
    }
  }, [value, data]);

  const handleSelect = (item: Item) => {
    setSelectedLabel(item.label);
    onSelect(item);
    setIsDropdownVisible(false);
  };

  return (
    <View className="">
      <TouchableOpacity
        className={clsx(
          "flex-row justify-between items-center h-16 border-gray-400 border-2 bg-white rounded-md px-4",
          { "border-gray-400": !errorMessage },
          { "border-red-400": errorMessage }
        )}
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

      {errorMessage && (
        <Text className="text-red-500 mt-1 ml-1">{errorMessage}</Text>
      )}

      {isDropdownVisible && (
        <View className="mt-4 bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
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
