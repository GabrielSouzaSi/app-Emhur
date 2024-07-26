import { TouchableOpacity, TouchableOpacityProps, Text, View } from "react-native";
import { UserCircle, CheckSquare, Car  } from "phosphor-react-native";
import colors from "tailwindcss/colors";

type Props = TouchableOpacityProps & {
    title: string;
    icon: string
}

export function MenuCard({title, icon}: Props){
    function RenderIcon(){
        if(icon == "UserCircle")
        return(
            <UserCircle size={30} color={colors.green[500]}></UserCircle>
        )
        if(icon == "CheckSquare")
        return(
            <CheckSquare size={30} color={colors.green[500]}></CheckSquare>
        )
        if(icon == "Car")
        return(
            <Car size={30} color={colors.green[500]}></Car>
        )
    }
    return (
        <TouchableOpacity className="bg-white p-2 py-3 border-l-4 border-green-500 shadow-slate-800 rounded-md items-center justify-center w-32" style={{elevation: 2}}>
            {RenderIcon()}
            <Text className="font-regular font-bold text-base text-green-500">
                {title}
            </Text>
        </TouchableOpacity>
    )
}