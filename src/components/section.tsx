import {
  View,
  ViewProps,
} from "react-native";
import styles from "@/styles/shadow";
import clsx from "clsx";

type Props = ViewProps;

export function Section({ children, className, ...rest }: Props) {
  return (
    <View
      className={clsx("flex bg-white m-4 p-5 rounded-md", className)}
      style={styles.shadow}
      {...rest}
    >
      {children}
    </View>
  );
}
