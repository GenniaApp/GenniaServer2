import { useMemo } from "react";

export default function useIsValidHexColor(hexColor) {
  return useMemo(() => {
    const isString = typeof hexColor === "string";

    if (isString) {
      const doesContainSharp = hexColor[0] === "#";
      const hexColorWithoutSharp = doesContainSharp
        ? hexColor.slice(1)
        : hexColor;

      const isValidHexNumber = !isNaN(Number("0x" + hexColorWithoutSharp));

      return isValidHexNumber;
    }

    return false;
  }, [hexColor]);
}
