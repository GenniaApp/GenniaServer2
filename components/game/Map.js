import React, { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Layer, Stage } from "react-konva";
import { playersPropTypes, mapPropTypes } from "./types";
import {
  usePossibleNextMapPositions,
  useSortedMapWithPosition,
} from "@/hooks/index";
import MapTileState from "./MapTileState";

function Map(props) {
  const { className, map, players, ...restProps } = props;
  const numberOfRows = useMemo(() => map.length, [map]);
  const numberOfColumns = useMemo(() => {
    const firstRow = map[0];
    return firstRow.length;
  }, [map]);

  const [tileSize, setTileSize] = useState(0);
  const handleChangeSize = useCallback((size) => {
    setTileSize(size);
  }, []);

  const mapWidth = useMemo(
    () => tileSize * numberOfColumns,
    [tileSize, numberOfColumns]
  );

  const mapHeight = useMemo(
    () => tileSize * numberOfRows,
    [tileSize, numberOfRows]
  );

  const [selectedMapPosition, setSelectedMapPosition] = useState({
    rowIndex: null,
    columnIndex: null,
  });

  const possibleNextMapPositions = usePossibleNextMapPositions({
    map,
    selectedMapPosition,
  });

  const sortedMapWithPosition = useSortedMapWithPosition({
    map,
    selectedMapPosition,
  });

  return (
    <Stage
      width={mapWidth}
      height={mapHeight}
      {...restProps}
      className={classNames("Map", className)}
    >
      <Layer>
        {sortedMapWithPosition.map(({ sortedTilesWithPosition, rowIndex }) => {
          return sortedTilesWithPosition.map(({ tile, columnIndex }) => {
            return (
              <MapTileState
                key={`${rowIndex}/${columnIndex}`}
                onChangeSize={handleChangeSize}
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                tile={tile}
                players={players}
                selectedMapPosition={selectedMapPosition}
                onChangeSelectedMapPosition={setSelectedMapPosition}
                possibleNextMapPositions={possibleNextMapPositions}
              />
            );
          });
        })}
      </Layer>
    </Stage>
  );
}

Map.propTypes = {
  className: PropTypes.string,
  map: mapPropTypes,
  players: playersPropTypes,
};

export default Map;
