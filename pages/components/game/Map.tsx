import { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import { PlayersProp, MapProp } from "./types-new";
import {
  usePossibleNextMapPositions,
} from "@/hooks/index";
import MapTileState from "./MapTileState";

interface MapProps {
  className?: string;
  map: MapProp;
  players: PlayersProp;
}

function Map(props: MapProps) {
  const { className, map, players } = props;
  const numberOfRows = useMemo(() => map.length, [map]);
  const numberOfColumns = useMemo(() => {
    const firstRow = map[0];
    return firstRow.length;
  }, [map]);

  const [tileSize, setTileSize] = useState(0);
  const handleChangeSize = useCallback((size: number) => {
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

  return (
    <div
      style={{
        width: mapWidth,
        height: mapHeight,
      }}
      className={classNames("Map", className)}
    >
      {map.map((tiles, rowIndex) => {
        return tiles.map((tile, columnIndex) => {
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
    </div>
  );
}

export default Map;
