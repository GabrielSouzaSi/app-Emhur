import clsx from "clsx";
import { ReactNode } from "react";
import { Text, TextProps, View, ViewProps } from "react-native";

type Props = ViewProps & {
  children: ReactNode;
};
type PropsData = TextProps & {
  title: string;
  subTitle: string;
};

function CTitleSubTitle({ children, className, ...rest }: Props) {
  return (
    <View className={clsx("flex flex-row space-x-4 p-4", className)} {...rest}>
      {children}
    </View>
  );
}

function TitleSubTitle({ title, subTitle, className, ...rest }: PropsData) {
  return (
    <View className={clsx("flex-1 items-center", className)} {...rest}>
      <Text className="font-regular text-lg">{title}:</Text>
      <Text className="font-semiBold text-lg">{subTitle}</Text>
    </View>
  );
}

CTitleSubTitle.TitleSubTitle = TitleSubTitle;

export { CTitleSubTitle };
