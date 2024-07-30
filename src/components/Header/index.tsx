import { View, Text } from "react-native";

type Props = {
  title: string;
};

export function Header({ title }: Props) {
  return (
    <View className="bg-white w-full flex-row items-center justify-center py-3">
      <Text className="text-green-500 font-regular text-2xl font-bold">
        {title}
      </Text>
    </View>
  );
}
