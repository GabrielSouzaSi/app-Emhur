import {
  View,
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { SignOut } from "phosphor-react-native";
import colors from "tailwindcss/colors";

type Props = TouchableOpacityProps;

export function HeaderMenu({ ...rest }: Props) {
  return (
    <View
      className="bg-white shadow-slate-700 mt-10 w-full flex flex-row justify-between items-center p-3"
      style={{ elevation: 2 }}
    >
      <Image className="" source={require("@assets/emhurMenu.png")} />
      <Image className="" source={require("@assets/prefeituraMenu.png")} />
      <TouchableOpacity>
        <SignOut size={30} color={colors.green[500]} />
      </TouchableOpacity>
    </View>
  );
}
