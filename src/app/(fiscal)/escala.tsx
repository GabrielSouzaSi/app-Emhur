import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { Section } from "@/components/section";
import { Calendar } from "@/components/calendar";
import { colors } from "@/styles/colors";
import { useEffect, useState } from "react";
import { server } from "@/server/api";
import { useAuth } from "@/hooks/useAuth";
import { Modal } from "@/components/modal";

interface Shift {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
}

interface Status {
  id: number;
  name: string;
  description: string;
}

interface Team {
  id: number;
  name: string;
}

interface Tasks {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
}

interface ScheduleItem {
  id: number;
  user_id: number;
  team_id: number;
  shift_id: number;
  status_id: number;
  reasons_id: number;
  scales_id: number;
  date: string;
  permuta: string | null;
  signed: boolean;
  created_at: string;
  updated_at: string;
  shift: Shift;
  status: Status;
  team: Team;
  tasks: Tasks[];
}

export default function Escala() {
  const { user } = useAuth();
  // Estado para armazenar os dias marcados e o dia selecionado
  const [markedDates, setMarkedDates] = useState<any>();
  const [selectedDay, setSelectedDay] = useState<ScheduleItem>();
  const [isVisible, setIsVisible] = useState(false);

  const [firstDate, setFirstDate] = useState<any>();
  const [lastDate, setLastDate] = useState<any>();

  const currentDate = new Date();

  // Função para transformar o array de objetos no formato desejado
  const transformData = (data: ScheduleItem[]) => {
    const transformed = data.reduce((acc, item) => {
      acc[item.date] = {
        dotColor: item.status.id === 2 ? "red" : "green", // Definindo cor com base no status (exemplo)
        marked: true,
        selectedColor: item.signed ? "yellow" : "gray", // Cor selecionada com base em algum atributo (exemplo)
      };
      return acc;
    }, {} as { [key: string]: { dotColor: string; marked: boolean; selectedColor: string } });

    setMarkedDates(transformed);
  };

  // Função para obter o primeiro dia do mês
  const getFirstDayOfMonth = () => {
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    setFirstDate(formatDate(firstDayOfMonth));
  };

  // Função para obter o último dia do mês
  const getLastDayOfMonth = () => {
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    setLastDate(formatDate(lastDayOfMonth));
  };

  // Função para formatar a data no formato "ano-mês-dia"
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses começam em 0, por isso +1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Função para buscar a lista dos locais da vistoria
  async function getListLocations() {
    try {
      const { data } = await server.get(
        `/schedules/user/${user.id}?start_date=${firstDate}&end_date=${lastDate}`
      );
      transformData(data);
      // setListLocations(result);
    } catch (error) {
      console.log(error);
    }
  }

  // Função para exibir os detalhes do dia selecionado
  async function onDayPress(day: any) {
    console.log(day);

    try {
      const { data } = await server.get(
        `/schedules/user/${user.id}/date/${day.dateString}`
      );
      
      setSelectedDay(data);
      setIsVisible(!isVisible);
    } catch (error) {
      console.log(error)
    }
    // setSelectedDay(day.dateString);
    // const event = events.find((e) => e.date === day.dateString);
    // if (event) {
    //   Alert.alert("Detalhes do Dia", event.details);
    // } else {
    //   Alert.alert("Nenhum evento", "Nenhum evento para este dia.");
    // }
  }

  const data = [
    { key: "1", label: "Trabalhando", color: "green", letter: "T" },
    { key: "2", label: "DRS / Folga", color: "red", letter: "D" },
    { key: "3", label: "Férias", color: "yellow", letter: "F" },
    { key: "4", label: "Licença", color: "deepskyblue", letter: "L" },
    { key: "5", label: "Plantão", color: "dodgerblue", letter: "P" },
  ];

  const convertDate = (dateString: string): string => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    getFirstDayOfMonth();
    getLastDayOfMonth();
    getListLocations();
  }, []);

  return (
    <>
      <View>
        <HeaderBack title="Escala" variant="primary" />
        <Section className="bg-slate-400">
          {markedDates ? (
            <Calendar markedDates={markedDates} onDayPress={onDayPress} />
          ) : (
            <></>
          )}
        </Section>
        <View style={styles.container}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <View style={[styles.circle, { backgroundColor: item.color }]}>
                  <Text style={styles.circleText}>{item.letter}</Text>
                </View>
                <Text style={styles.label}>{item.label}</Text>
              </View>
            )}
            horizontal={false}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
      <Modal
        variant="primary"
        visible={isVisible}
        onClose={() => setIsVisible(false)}
      >
        {selectedDay?.id && (
          <View className="flex">
            <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
              Escala {convertDate(selectedDay?.date)}
            </Text>
            <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              {/* <View className="flex flex-row justify-between mb-4 gap-4">
            <View className="flex-1">
              <Text className="text-gray-500 font-regular text-2xl font-bold">
                Nome:
              </Text>
              <View className="bg-gray-300 rounded-md p-3">
                <Text className="font-semiBold text-lg">
                  {}
                </Text>
              </View>
            </View>
          </View> */}

              <View className="flex flex-row justify-between mb-4 gap-4">
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Turno:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {selectedDay?.shift.description}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Horário:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {selectedDay?.shift.start_time}/
                      {selectedDay?.shift.end_time}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex flex-row justify-between mb-4 gap-4">
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Status:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {selectedDay?.status.description}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Equipe:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {selectedDay?.team.name}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex flex-row justify-between mb-4 gap-4">
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Demandas:
                  </Text>
                  <FlatList
                    data={selectedDay.tasks}
                    keyExtractor={(item) => item.name}
                    renderItem={({ item }) => (
                        <Text className="text-lg font-semiBold">
                          {item.description}/{item.start_time}-{item.end_time}
                        </Text>
                    )}
                    horizontal={false}
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  circleText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
});
