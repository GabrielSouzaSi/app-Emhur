import { View, Text } from "react-native";
import styles from "@/styles/shadow";
type Props = {
  title: string;
};

export function Header({ title }: Props) {
  return (
    <View
      className="bg-white w-full flex-row items-center justify-center py-3"
      style={styles.shadow}
    >
      <Text className="text-blue-500 font-regular text-2xl font-bold">
        {title}
      </Text>
    </View>
  );
}
