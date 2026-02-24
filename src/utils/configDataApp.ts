import { server } from "@/server/api";
import { Alert } from "react-native";

import { delDatabaseApproach } from "@/database/approach";
import { delDatabaseDriverType } from "@/database/driverTypes";
import { delDatabaseFundiaryOccupationType } from "@/database/fundiaryOccupationType";
import { delDatabaseFundiaryUseType } from "@/database/fundiaryUseType";
import { delDatabaseInspectionLocation } from "@/database/InspectionLocation";
import { delDatabasePermitType } from "@/database/permitType";
import { delDatabaseReason } from "@/database/reason";
import { delDatabaseViolationCode } from "@/database/violationsCode";
import Toast from "react-native-toast-message";


// Função para receber os motivos da vistoria
async function getInspectionReasons() {
    try {
        const { data } = await server.get(`/inspection-reasons-all`);
        // Função para adicionar no banco os motivos da vistoria
        await delDatabaseReason(data);
    } catch (error) {
        return "Motivos da Vistoria";
    }
}

// Função para receber o código das autuações
async function getViolationsCode() {
    try {
        const { data } = await server.get(`/violations-code`);
        // console.log("violations => ", data);

        const violationsCodeData = await data.map((item: any) => ({
            id: item.id,
            code: item.code,
            description: item.description,
            permitTypes: item.permit_types.map((permitType: any) => ({
                id: permitType.id,
                name: permitType.name,
            })),
        }));

        // Remover e adicionar no banco os codigos de autuação
        await delDatabaseViolationCode(violationsCodeData);
    } catch (error) {
        return "Códigos de Autuações";
    }
}
// Função para receber o modo de abordagem
async function getApproach() {
    try {
        const { data } = await server.get(`/vehicle/1`);
        const { approach } = data;
        await delDatabaseApproach(approach);
    } catch (error) {
        Alert.alert(
            "Aviso!",
            "Não foi possível carregar o modo de abordagem. Tente novamente."
        );
    }
}
// Função para receber o tipo de condutor
async function getDriverType() {
    try {
        const { data } = await server.get(`/driver-types`);

        await delDatabaseDriverType(data);
    } catch (error) {
        return "Tipo de condutor";
    }
}
// Função para buscar a lista dos locais da vistoria
async function getInspectionLocations() {
    try {
        const { data } = await server.get("/inspection-locations");

        await delDatabaseInspectionLocation(data);
    } catch (error) {
        return "Locais de Vistoria";
    }
}
// Função para pegar os dados de configuração do app
async function getAll() {
    try {
        const { data } = await server.get("/search-all");

        const { approach, permitType, fundiaryOccupationType, fundiaryUseType } = data;

        await delDatabaseApproach(approach);
        await delDatabasePermitType(permitType)
        await delDatabaseFundiaryOccupationType(fundiaryOccupationType)
        await delDatabaseFundiaryUseType(fundiaryUseType)
    } catch (error) {
        return "Dados de configuração do app";
    }
}

export async function update() {
    const results = await Promise.allSettled([
        getInspectionReasons(),
        getInspectionLocations(),
        getDriverType(),
        getViolationsCode(),
        getAll(),
    ]);

    // Coletar nomes dos erros
    const errors: string[] = [];

    results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
            // Se a função retornou uma string, é um erro
            errors.push(result.value);
        }

        if (result.status === "rejected") {
            // Algum erro não tratado (não deve ocorrer, mas por segurança)
            errors.push("Erro desconhecido");
        }
    });

    if (errors.length === 0) {
        Toast.show({
            type: "success",
            text1: "Dados atualizados com sucesso!",
        });
        return;
    }

    // Montar mensagem de erro agrupada
    const msg = errors.join(", ");

    Toast.show({
        type: "error",
        text1: "Falha ao atualizar dados!",
        text2: `Itens com erro: ${msg}.`,
    });
}

