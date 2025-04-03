import { TextInput, TextInputProps } from "react-native";
import clsx from "clsx";
import styles from "@/styles/shadow";

type Variants = "primary" | "secundary";

type InputProps = TextInputProps & {
  variant?: Variants;
};

function Field({ className, variant = "secundary", ...rest }: InputProps) {
  return (
    <TextInput
      className={clsx(
        "h-16 border-gray-300 border bg-white font-semiBold text-lg rounded-md px-4",
        { "focus:border-blue-500": variant === "primary" },
        { "focus:border-green-500": variant === "secundary" },
        className
      )}
      style={styles.shadow}
      {...rest}
    />
  );
}

export { Field };
