import { useCallback, useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import { MapDataProp, Player } from '@/lib/types';
import usePossibleNextMapPositions from '@/lib/use-possible-next-map-positions';
import MapTile from './MapTile';

interface GameMapProps {
  className?: string;
  mapData: MapDataProp;
  players: Player[];
}

function GameMap(props: GameMapProps) {
  const { className, mapData, players } = props;
  const numberOfRows = useMemo(() => mapData.length, [mapData]);
  const numberOfColumns = useMemo(() => {
    const firstRow = mapData[0];
    return firstRow.length;
  }, [mapData]);

  const [zoom, setZoom] = useState(1);
  const [tileSize, setTileSize] = useState(50);
  const mapWidth = useMemo(
    () => tileSize * numberOfColumns,
    [tileSize, numberOfColumns]
  );

  const mapHeight = useMemo(
    () => tileSize * numberOfRows,
    [tileSize, numberOfRows]
  );

  const [selectedMapPosition, setSelectedMapPosition] = useState({
    x: -1,
    y: -1,
  });

  const possibleNextMapPositions = usePossibleNextMapPositions({
    mapData,
    selectedMapPosition,
  });

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case '1':
        setZoom(0.8);
        break;
      case '2':
        setZoom(1.0);
        break;
      case '3':
        setZoom(1.2);
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      style={{
        width: mapWidth,
        height: mapHeight,
      }}
      className={classNames('GameMap', className)}
    >
      {mapData.map((tiles, x) => {
        return tiles.map((tile, y) => {
          return (
            <MapTile
              key={`${x}/${y}`}
              zoom={zoom}
              size={tileSize}
              x={x}
              y={y}
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

export default GameMap;
