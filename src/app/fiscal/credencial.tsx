import React from "react";
import { Text, View } from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Section } from "@/components/section";
import { CTitleSubTitle } from "@/components/titleSubTitle";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { server } from "@/server/api";

export default function CredencialFiscal() {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [fiscal, setFiscal] = useState<any>();

  async function getInfoFiscal() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/agent/${user.id}`);
      console.log(data);
      setFiscal(data)
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }
  useEffect(() => {
    getInfoFiscal();
  }, []);
  return (
    <View className="flex-1">
      <HeaderBack title="Credencial" variant="primary" />
      {fiscal ? (
        <Section>
        <View className="items-center justify-center mb-5">
          <MaterialCommunityIcons name="account-box-outline" size={90} />
          <Text className="font-semiBold text-lg">{user.name}</Text>
          <Text className="font-regular text-lg">N° 652478</Text>
        </View>

        <CTitleSubTitle>
          <CTitleSubTitle.TitleSubTitle title="Setor" subTitle={fiscal.setor} />
          <CTitleSubTitle.TitleSubTitle title="Cargo" subTitle={fiscal.cargo} />
        </CTitleSubTitle>

        <CTitleSubTitle>
          <CTitleSubTitle.TitleSubTitle title="Matrícula" subTitle={fiscal.matricula} />
          <CTitleSubTitle.TitleSubTitle
            title="Ativo desde"
            subTitle={fiscal.data_entrada}
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
      ): (<></>)}
    </View>
  );
}
