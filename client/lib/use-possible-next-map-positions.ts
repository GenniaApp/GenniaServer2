import { useMemo } from 'react';
import { Position } from './types';

interface UsePossibleNextMapPositionsProps {
  width: number;
  height: number;
  selectedMapTileInfo: Position;
}

export default function usePossibleNextMapPositions({
  width,
  height,
  selectedMapTileInfo,
}: UsePossibleNextMapPositionsProps) {
  const isMapSelected = useMemo(() => {
    const { x, y } = selectedMapTileInfo;
    return x !== -1 && y !== -1;
  }, [selectedMapTileInfo]);


  const topMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { x, y: topColumnIndex } = selectedMapTileInfo;
    const topRowIndex = x - 1;

    if (topRowIndex < 0) {
      return;
    }

    return { x: topRowIndex, y: topColumnIndex };
  }, [isMapSelected, selectedMapTileInfo, 0]);

  const bottomMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { x, y: bottomColumnIndex } = selectedMapTileInfo;
    const bottomRowIndex = x + 1;

    if (bottomRowIndex > height) {
      return;
    }

    return {
      x: bottomRowIndex,
      y: bottomColumnIndex,
    };
  }, [isMapSelected, selectedMapTileInfo, height]);

  const leftMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { x: leftRowIndex, y } = selectedMapTileInfo;
    const leftColumnIndex = y - 1;

    if (leftColumnIndex < 0) {
      return;
    }

    return {
      x: leftRowIndex,
      y: leftColumnIndex,
    };
  }, [isMapSelected, selectedMapTileInfo, 0]);

  const rightMovePosition = useMemo(() => {
    if (!isMapSelected) {
      return;
    }

    const { x: rightRowIndex, y } = selectedMapTileInfo;
    const rightColumnIndex = y + 1;

    if (rightColumnIndex > width) {
      return;
    }

    return {
      x: rightRowIndex,
      y: rightColumnIndex,
    };
  }, [isMapSelected, selectedMapTileInfo, width]);

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
