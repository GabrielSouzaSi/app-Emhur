import { ReactNode } from "react";
import { TextInput, TextInputProps, View, ViewProps } from "react-native";
import clsx from "clsx";
import colors from "tailwindcss/colors";

type Variants = "primary" | "secundary";

type InputProps = TextInputProps & {
  variant?: Variants;
};

function Field({ className, variant = "secundary", ...rest }: InputProps) {
  return (
    <TextInput
      className={clsx(
        "h-16 border-gray-400 border-2 rounded-md text-gray-400 px-4",
        { "focus:border-blue-500": variant === "primary" },
        { "focus:border-green-500": variant === "secundary" },
        className
      )}
      {...rest}
    />
  );
}

export { Field };
