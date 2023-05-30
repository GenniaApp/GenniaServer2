import { useMemo } from "react";

export default function useIsValidPositiveInteger(maybePositiveInteger) {
  return useMemo(() => {
    const isNull = maybePositiveInteger === null;
    const isInteger = Number.isInteger(maybePositiveInteger);
    const isPositive = maybePositiveInteger > 0;
    const isIntegerAndPositive = isInteger && isPositive;

    return isNull || isIntegerAndPositive;
  }, [maybePositiveInteger]);
}
