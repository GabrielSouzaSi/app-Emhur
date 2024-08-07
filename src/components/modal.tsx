import {
  Text,
  ModalProps,
  Modal as RNModal,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import styles from "@/styles/shadow";

// type Props = ModalProps & {
//   title: string
//   subtitle?: string
//   onClose?: () => void
// }

type Variants = "primary" | "secundary";

type Props = ModalProps & {
  onClose?: () => void;
  variant?: Variants;
};

export function Modal({
  onClose,
  variant = "secundary",
  children,
  ...rest
}: Props) {
  return (
    <RNModal animationType="slide" transparent {...rest}>
      <BlurView
        className="flex-1"
        intensity={5}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
      >
        <View
          className="mx-4 my-24 flex-1 bg-white p-4 rounded-md"
          style={styles.shadow}
        >
          <View className="flex-row justify-end mb-4">
            {onClose && (
              <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={30}
                  color={variant === "primary" ? "#008dd0" : "#0da63e"}
                />
              </TouchableOpacity>
            )}
          </View>
          {children}
        </View>
      </BlurView>
    </RNModal>
  );
}
