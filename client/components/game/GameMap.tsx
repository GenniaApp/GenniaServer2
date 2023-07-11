import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import usePossibleNextMapPositions from '@/lib/use-possible-next-map-positions';
import { useGame } from '@/context/GameContext';
import MapTile from './MapTile';

function GameMap() {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const { mapData } = useGame();
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    setStartPosition({
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    });
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (dragging && ref.current) {
      setPosition({
        x: event.clientX - startPosition.x,
        y: event.clientY - startPosition.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const numberOfRows = useMemo(() => mapData.length, [mapData]);
  const numberOfColumns = useMemo(() => {
    if (mapData.length === 0) return 0;
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
      ref={ref}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        width: mapWidth,
        height: mapHeight,
      }}
      onMouseDown={handleMouseDown}
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
