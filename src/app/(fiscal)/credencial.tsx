import { Text, View } from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Section } from "@/components/section";
import { CTitleSubTitle } from "@/components/titleSubTitle";

export default function CredencialFiscal() {
  return (
    <View className="flex-1">
      <HeaderBack title="Credencial" variant="primary" />
      <Section>
        <View className="items-center justify-center mb-5">
          <MaterialCommunityIcons name="account-box-outline" size={90} />
          <Text className="font-semiBold text-lg">Gabriel Souza</Text>
          <Text className="font-regular text-lg">N° 652478</Text>
        </View>

        <CTitleSubTitle>
          <CTitleSubTitle.TitleSubTitle title="Setor:" subTitle="N° 652478" />
          <CTitleSubTitle.TitleSubTitle title="Cargo:" subTitle="N° 652478" />
        </CTitleSubTitle>

        <CTitleSubTitle>
          <CTitleSubTitle.TitleSubTitle title="Matrícula:" subTitle="000000" />
          <CTitleSubTitle.TitleSubTitle
            title="Ativo desde:"
            subTitle="02/2015"
          />
        </CTitleSubTitle>

        <View className="items-center justify-center mt-5">
          <MaterialCommunityIcons name="qrcode" size={90} />
          <CTitleSubTitle>
            <CTitleSubTitle.TitleSubTitle
              title="Código de validação:"
              subTitle="FFRHAETJUFVVTJ+"
            />
          </CTitleSubTitle>
        </View>
      </Section>
    </View>
  );
}
