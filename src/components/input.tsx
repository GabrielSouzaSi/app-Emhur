import { TextInput, TextInputProps } from "react-native";
import clsx from "clsx";

type Variants = "primary" | "secundary";

type InputProps = TextInputProps & {
  variant?: Variants;
};

function Field({ className, variant = "secundary", ...rest }: InputProps) {
  return (
    <TextInput
      className={clsx(
        "h-16 border-gray-400 border-2 bg-white font-semiBold text-lg rounded-md px-4",
        { "focus:border-blue-500": variant === "primary" },
        { "focus:border-green-500": variant === "secundary" },
        className
      )}
      {...rest}
    />
  );
}

export { Field };
