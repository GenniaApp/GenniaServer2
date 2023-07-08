import { useMemo } from 'react';
import { MapDataProp, Position } from '@/lib/types';

interface UsePossibleNextMapPositionsProps {
  mapData: MapDataProp;
  selectedMapPosition: Position;
}

export default function usePossibleNextMapPositions({
  mapData,
  selectedMapPosition,
}: UsePossibleNextMapPositionsProps) {
  const isMapSelected = useMemo(() => {
    const { x, y } = selectedMapPosition;
    return x !== -1 && y !== -1;
  }, [selectedMapPosition]);

  const minMapRowIndex = useMemo(() => {
    return 0;
  }, []);

  const maxMapRowIndex = useMemo(() => {
    return mapData.length - 1;
  }, [mapData]);

  const minMapColumnIndex = useMemo(() => {
    return 0;
  }, []);

  const maxMapColumnIndex = useMemo(() => {
    const [tilesOfFirstRow] = mapData;
    return tilesOfFirstRow.length - 1;
  }, [mapData]);

  const topMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { x, y: topColumnIndex } = selectedMapPosition;
    const topRowIndex = x - 1;

    if (topRowIndex < minMapRowIndex) {
      return;
    }

    return { x: topRowIndex, y: topColumnIndex };
  }, [isMapSelected, selectedMapPosition, minMapRowIndex]);

  const bottomMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { x, y: bottomColumnIndex } = selectedMapPosition;
    const bottomRowIndex = x + 1;

    if (bottomRowIndex > maxMapRowIndex) {
      return;
    }

    return {
      x: bottomRowIndex,
      y: bottomColumnIndex,
    };
  }, [isMapSelected, selectedMapPosition, maxMapRowIndex]);

  const leftMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { x: leftRowIndex, y } = selectedMapPosition;
    const leftColumnIndex = y - 1;

    if (leftColumnIndex < minMapColumnIndex) {
      return;
    }

    return {
      x: leftRowIndex,
      y: leftColumnIndex,
    };
  }, [isMapSelected, selectedMapPosition, minMapColumnIndex]);

  const rightMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { x: rightRowIndex, y } = selectedMapPosition;
    const rightColumnIndex = y + 1;

    if (rightColumnIndex > maxMapColumnIndex) {
      return;
    }

    return {
      x: rightRowIndex,
      y: rightColumnIndex,
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
