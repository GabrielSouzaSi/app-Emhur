import {
  View,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import clsx from "clsx";
import colors from "tailwindcss/colors";
import styles from "@/styles/shadow";

type Variants = "primary" | "secundary";

type Props = TouchableOpacityProps & {
  title: string;
  variant?: Variants;
};

export function HeaderBack({
  title,
  variant = "secundary",
  className,
  ...rest
}: Props) {
  const router = useRouter();
  return (
    <View className="bg-white flex flex-row py-3" style={styles.shadow}>
      <TouchableOpacity
        onPress={() => router.back()}
        className={clsx(
          "items-center p-1 ml-4 rounded-md",
          { "bg-blue-500": variant === "primary" },
          { "bg-green-500": variant === "secundary" },
          className
        )}
      >
        <MaterialCommunityIcons name="arrow-left" size={30} color={colors.white} />
      </TouchableOpacity>

      <View className="flex w-full items-center justify-center absolute py-4">
        <Text
          className={clsx(
            "font-regular text-2xl font-bold",
            { "text-blue-500": variant === "primary" },
            { "text-green-500": variant === "secundary" }
          )}
        >
          {title}
        </Text>
      </View>
    </View>
  );
}
