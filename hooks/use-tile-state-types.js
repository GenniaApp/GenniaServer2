import { useMemo } from "react";

export default function useTileStateTypes() {
  const typesEnum = useMemo(
    () => ({
      0: "BASE",
      1: "SPAWNER",
      2: "FOG",
      3: "ARMY",
      4: "BLANK",
    }),
    []
  );

  const typeKeys = useMemo(() => Object.keys(typesEnum), [typesEnum]);
  const typeValues = useMemo(() => Object.values(typesEnum), [typesEnum]);

  return { typesEnum, typeKeys, typeValues };
}
