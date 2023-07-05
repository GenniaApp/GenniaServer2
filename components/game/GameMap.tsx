import { useCallback, useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import { PlayersProp, MapProp } from './types-new';
import { usePossibleNextMapPositions } from '@/hooks/index';
import MapTile from './MapTile';

interface MapProps {
  className?: string;
  gameMap: MapProp;
  players: PlayersProp;
}

function GameMap(props: MapProps) {
  const { className, gameMap, players } = props;
  const numberOfRows = useMemo(() => gameMap.length, [gameMap]);
  const numberOfColumns = useMemo(() => {
    const firstRow = gameMap[0];
    return firstRow.length;
  }, [gameMap]);

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
    rowIndex: null,
    columnIndex: null,
  });

  const possibleNextMapPositions = usePossibleNextMapPositions({
    gameMap,
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
      {gameMap.map((tiles, rowIndex) => {
        return tiles.map((tile, columnIndex) => {
          return (
            <MapTile
              key={`${rowIndex}/${columnIndex}`}
              zoom={zoom}
              size={tileSize}
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

export default GameMap;
