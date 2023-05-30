import { useMemo } from "react";

export default function usePossibleNextMapPositions({
  map,
  selectedMapPosition,
}) {
  const isMapSelected = useMemo(() => {
    const { rowIndex, columnIndex } = selectedMapPosition;
    return rowIndex !== null && columnIndex !== null;
  }, [selectedMapPosition]);

  const minMapRowIndex = useMemo(() => {
    return 0;
  }, []);

  const maxMapRowIndex = useMemo(() => {
    return map.length - 1;
  }, [map]);

  const minMapColumnIndex = useMemo(() => {
    return 0;
  }, []);

  const maxMapColumnIndex = useMemo(() => {
    const [tilesOfFirstRow] = map;
    return tilesOfFirstRow.length - 1;
  }, [map]);

  const topMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { rowIndex, columnIndex: topColumnIndex } = selectedMapPosition;
    const topRowIndex = rowIndex - 1;

    if (topRowIndex < minMapRowIndex) {
      return;
    }

    return { rowIndex: topRowIndex, columnIndex: topColumnIndex };
  }, [isMapSelected, selectedMapPosition, minMapRowIndex]);

  const bottomMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { rowIndex, columnIndex: bottomColumnIndex } = selectedMapPosition;
    const bottomRowIndex = rowIndex + 1;

    if (bottomRowIndex > maxMapRowIndex) {
      return;
    }

    return {
      rowIndex: bottomRowIndex,
      columnIndex: bottomColumnIndex,
    };
  }, [isMapSelected, selectedMapPosition, maxMapRowIndex]);

  const leftMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { rowIndex: leftRowIndex, columnIndex } = selectedMapPosition;
    const leftColumnIndex = columnIndex - 1;

    if (leftColumnIndex < minMapColumnIndex) {
      return;
    }

    return {
      rowIndex: leftRowIndex,
      columnIndex: leftColumnIndex,
    };
  }, [isMapSelected, selectedMapPosition, minMapColumnIndex]);

  const rightMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { rowIndex: rightRowIndex, columnIndex } = selectedMapPosition;
    const rightColumnIndex = columnIndex + 1;

    if (rightColumnIndex > maxMapColumnIndex) {
      return;
    }

    return {
      rowIndex: rightRowIndex,
      columnIndex: rightColumnIndex,
    };
  }, [isMapSelected, selectedMapPosition, maxMapColumnIndex]);

  const possibleNextMapPositions = useMemo(
    () => ({
      top: topMovePosition,
      right: rightMovePosition,
      bottom: bottomMovePosition,
      left: leftMovePosition,
    }),
    [topMovePosition, rightMovePosition, bottomMovePosition, leftMovePosition]
  );

  return possibleNextMapPositions;
}
