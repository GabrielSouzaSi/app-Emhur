import { Text, TextInput, TextInputProps } from "react-native";
import clsx from "clsx";

type Variants = "primary" | "secundary";

type InputProps = TextInputProps & {
  variant?: Variants;
  errorMessage?: string;
};

function Field({
  className,
  variant = "secundary",
  errorMessage,
  ...rest
}: InputProps) {
  return (
    <>
      <TextInput
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
        textBreakStrategy="simple"
        importantForAutofill="no"
        keyboardType="default"
        underlineColorAndroid="transparent"
        className={clsx(
          "h-16 border-2 bg-white font-semiBold text-lg rounded-md px-4 focus:border-blue-500",
          { "border-gray-400": !errorMessage },
          { "border-red-400": errorMessage },
          className
        )}
        {...rest}
      />
      {errorMessage && (
        <Text className="text-red-500 mt-1 ml-1">{errorMessage}</Text>
      )}
    </>
  );
}

export { Field };
