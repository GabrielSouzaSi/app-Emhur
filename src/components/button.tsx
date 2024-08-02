import { ReactNode } from "react";
import {
  Text,
  TextProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import clsx from "clsx";

type Variants = "primary" | "secundary";

type ButtonProps = TouchableOpacityProps & {
  children: ReactNode;
  variant?: Variants;
};

type TextButtonProps = TextProps & {
  title: string;
};


function Button({
  children,
  variant = "secundary",
  className,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={clsx(
        "w-full items-center justify-center p-4 rounded-md",
        { "bg-blue-500": variant === "primary" },
        { "bg-green-500": variant === "secundary" },
        className
      )}
      {...rest}
    >
      {children}
    </TouchableOpacity>
  );
}

function TextButton({title, ...rest }: TextButtonProps) {
  return (
    <Text
      className="font-regular font-bold text-2xl text-white"
      {...rest}
    >{title}</Text>
  );
}

Button.TextButton = TextButton;

export { Button };
