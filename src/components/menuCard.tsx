import { forwardRef } from "react";
import { TouchableOpacity, TouchableOpacityProps, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "tailwindcss/colors";
import clsx from "clsx";

type Variants = "primary" | "secundary";

type Props = TouchableOpacityProps & {
  title: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  variant?: Variants;
};

const MenuCard = forwardRef<TouchableOpacity, Props>(
  ({ title, icon, variant = "secundary", className, ...rest }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={clsx(
          "bg-white py-2 border-l-4 shadow-slate-800 rounded-md items-center justify-center flex-1 m-2",
          { "border-blue-500": variant === "primary" },
          { "border-green-500": variant === "secundary" },
          className
        )}
        style={{ elevation: 2 }}
        {...rest}
      >
        <MaterialCommunityIcons
          name={icon}
          size={30}
          color={variant === "primary" ? "#008dd0" : "#0da63e"}
        />
        <Text
          className={clsx(
            "font-regular font-bold text-base",
            { "text-blue-500": variant == "primary" },
            { "text-green-500": variant == "secundary" }
          )}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);

const MenuCardSmall = forwardRef<TouchableOpacity, Props>(
  ({ title, variant = "secundary", className, ...rest }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={clsx(
          "w-full bg-white my-3 py-2 border-l-4 rounded-md justify-center pl-2",
          { "border-blue-500": variant === "primary" },
          { "border-green-500": variant === "secundary" },
          className
        )}
        style={{ elevation: 2 }}
        {...rest}
      >
        <Text
          className={clsx(
            "font-semiBold font-bold text-lg",
            { "text-blue-500": variant == "primary" },
            { "text-green-500": variant == "secundary" }
          )}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);
const SubMenuCardSmall = forwardRef<TouchableOpacity, Props>(
  ({ title, variant = "secundary", className, ...rest }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={clsx(
          "w-full bg-white my-2 py-2 border-l-2 justify-center pl-2",
          { "border-blue-500": variant === "primary" },
          { "border-green-500": variant === "secundary" },
          className
        )}
        style={{ elevation: 2 }}
        {...rest}
      >
        <Text
          className={clsx(
            "font-semiBold font-bold text-base",
            { "text-blue-500": variant == "primary" },
            { "text-green-500": variant == "secundary" }
          )}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
);

export { MenuCard, MenuCardSmall, SubMenuCardSmall };
