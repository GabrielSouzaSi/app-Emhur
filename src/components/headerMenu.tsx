import {
  View,
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "@/hooks/useAuth";

import styles from "@/styles/shadow";
import { colors } from "@/styles/colors";

export function HeaderMenu( ) {

  const { signOut } = useAuth();

  function handleSignOut(){
    signOut();
  }

  const router = useRouter();
  return (
    <View
      className="bg-white w-full flex flex-row justify-between items-center py-3 px-5 mb-5"
      style={styles.shadow}
    >
      <Image className="w-12 h-12" source={require("@/assets/app-fiscal.png")} />
      <TouchableOpacity onPress={() => handleSignOut()}>
        <MaterialCommunityIcons name="logout" size={30} color={colors.blue[500]} />
      </TouchableOpacity>
    </View>
  );
}
