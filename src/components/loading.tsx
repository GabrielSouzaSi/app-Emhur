import Spinner from "react-native-loading-spinner-overlay";

import colors from "tailwindcss/colors";

export function Loading() {
  return (
      <Spinner
        //Valor booleano para tornar spinner visivel
        visible
        color={colors.green[500]}
      />
  );
}
