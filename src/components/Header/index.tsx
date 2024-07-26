import { View, Text} from "react-native";
import { styled } from 'nativewind';

const StyledView = styled(View)
const StyledText = styled(Text)

type Props = {
    title: string;
}

export function Header({title}: Props){
    return(
        <StyledView className="bg-white shadow-slate-700 mt-10 w-full flex-row items-center justify-center py-3" style={{elevation: 2}}>
            <StyledText className="text-green-500 font-regular text-2xl font-bold">{title}</StyledText>
        </StyledView>
    )
}