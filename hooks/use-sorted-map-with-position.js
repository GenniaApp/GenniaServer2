import { useMemo } from "react";

export default function useSortedMapWithPosition({ map, selectedMapPosition }) {
  // react-konva only supports zIndex
  // by the sorting of the children components
  // https://konvajs.org/docs/react/zIndex.html#How-to-change-zIndex-and-reorder-components-in-react-konva
  const sortedMapWithPosition = useMemo(() => {
    const mapWithPosition = map.map((tiles, rowIndex) => {
      const tilesWithPosition = tiles.map((tile, columnIndex) => {
        return { tile, columnIndex };
      });

      return {
        tilesWithPosition,
        rowIndex,
      };
    });

    const sortedMapWithPosition = mapWithPosition.sort((leftRow, rightRow) => {
      const isLeftRowSelected =
        leftRow.rowIndex === selectedMapPosition.rowIndex;

      if (isLeftRowSelected) {
        return 1;
      }

      const isRightRowSelected =
        rightRow.rowIndex === selectedMapPosition.rowIndex;

      if (isRightRowSelected) {
        return -1;
      }

      return 0;
    });

    return sortedMapWithPosition.map((row) => {
      const { tilesWithPosition, rowIndex } = row;
      const sortedTilesWithPosition = tilesWithPosition.sort(
        (leftTile, rightTile) => {
          const isLeftTileSelected =
            leftTile.columnIndex === selectedMapPosition.columnIndex;

          if (isLeftTileSelected) {
            return 1;
          }

          const isRightTileSelected =
            rightTile.columnIndex === selectedMapPosition.columnIndex;

          if (isRightTileSelected) {
            return -1;
          }

          return 0;
        }
      );

      return {
        sortedTilesWithPosition,
        rowIndex,
      };
    });
  }, [map, selectedMapPosition]);

  return sortedMapWithPosition;
}
