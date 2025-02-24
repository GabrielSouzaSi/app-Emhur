import {
  Calendar as RNCalendar,
  CalendarProps,
  LocaleConfig,
} from "react-native-calendars";
import { ptBR } from "@/utils/localeCalendarConfig";
import { colors } from "@/styles/colors";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

export function Calendar({ ...rest }: CalendarProps) {
  return (
    <RNCalendar
      hideExtraDays
      style={{
        margin: 12,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: colors.zinc[500],
      }}
      theme={{
        textMonthFontSize: 18,
        selectedDayBackgroundColor: colors.lime[300],
        selectedDayTextColor: "#F06543",
        // textDayFontFamily: fontFamily.regular,
        monthTextColor: colors.zinc[200],
        arrowColor: colors.zinc[400],
        agendaDayNumColor: colors.zinc[200],
        todayTextColor: colors.lime[300],
        textDisabledColor: colors.zinc[500],
        calendarBackground: "transparent",
        textDayStyle: { color: colors.zinc[200] },
      }}
      {...rest}
    />
  );
}
