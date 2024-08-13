import {
  View,
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import styles from "@/styles/shadow";

type Variants = "primary"|"secundary"

type Props = TouchableOpacityProps & {
  onLogout: () => void;
  variant?: Variants;
}

export function HeaderMenu({variant="secundary", onLogout, ...rest }: Props) {
  const router = useRouter();
  return (
    <View
      className="bg-white w-full flex flex-row justify-between items-center py-3 px-5 mb-5"
      style={styles.shadow}
      {...rest}
    >
      <Image className="w-10 h-12" source={require("@assets/emhurMenu.png")} />
      <Image className="w-12 h-12" source={require("@assets/prefeituraMenu.png")} />
      <TouchableOpacity onPress={() => onLogout()}>
        <MaterialCommunityIcons name="logout" size={30} color={variant === "primary"? "#008dd0":"#0da63e"} />
      </TouchableOpacity>
    </View>
  );
}
