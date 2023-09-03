import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import usePossibleNextMapPositions from '@/lib/use-possible-next-map-positions';
import { useGame, useGameDispatch } from '@/context/GameContext';
import MapTile from './MapTile';
import useMapDrag from '@/hooks/useMapDrag';
import { TileType, Room, Route, Position } from '@/lib/types';
import useMediaQuery from '@mui/material/useMediaQuery';

function GameMap() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const {
    zoom,
    attackQueueRef,
    room,
    mapData,
    myPlayerId,
    mapQueueData,
    selectedMapTileInfo,
    initGameInfo,
  } = useGame();

  const { setZoom, setSelectedMapTileInfo, mapQueueDataDispatch } =
    useGameDispatch();
  const mapRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<any>(null);

  const [tileSize, setTileSize] = useState(40);

  const isSmallScreen = useMediaQuery('(max-width:600px)');
  useEffect(() => {
    setZoom(isSmallScreen ? 0.7 : 1.0);
  }, [isSmallScreen, setZoom]);

  useMapDrag(mapRef, position, setPosition, zoom, setZoom);

  useEffect(() => {
    selectRef.current = selectedMapTileInfo;
  }, [selectedMapTileInfo]);

  const withinMap = useCallback(
    (point: Position) => {
      if (!initGameInfo) return false;
      return (
        0 <= point.x &&
        point.x < initGameInfo.mapWidth &&
        0 <= point.y &&
        point.y < initGameInfo.mapHeight
      );
    },
    [initGameInfo]
  );

  const handlePositionChange = useCallback(
    (newPoint: Position, className: string) => {
      if (withinMap(newPoint)) {
        attackQueueRef.current.insert({
          from: selectedMapTileInfo,
          to: newPoint,
          half: selectedMapTileInfo.half,
        });
        setSelectedMapTileInfo({
          // ...selectedMapTileInfo,
          x: newPoint.x,
          y: newPoint.y,
          half: false,
          unitsCount: 0,
        });
        mapQueueDataDispatch({
          type: 'change',
          x: selectedMapTileInfo.x,
          y: selectedMapTileInfo.y,
          className: className,
        });
      }
    },
    [
      selectedMapTileInfo,
      withinMap,
      attackQueueRef,
      mapQueueDataDispatch,
      setSelectedMapTileInfo,
    ]
  );

  const mapPixelWidth = useMemo(
    () => tileSize * (room.map ? room.map.width : 0) * zoom,
    [tileSize, room, zoom]
  );
  const mapPixelHeight = useMemo(
    () => tileSize * (room.map ? room.map.width : 0) * zoom,
    [tileSize, room, zoom]
  );

  const possibleNextMapPositions = usePossibleNextMapPositions({
    width: room.map ? room.map.width : 0,
    height: room.map ? room.map.height : 0,
    selectedMapTileInfo,
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case '1': {
          if (initGameInfo && initGameInfo.mapWidth > 20) {
            setZoom(0.5);
          } else {
            setZoom(0.7);
          }
          break;
        }
        case '2':
          setZoom(1.0);
          break;
        case '3':
          setZoom(1.3);
          break;
        default:
          break;
      }

      let newPoint = { x: -1, y: -1 };
      let route: Route | undefined;

      if (!selectedMapTileInfo) return;
      switch (event.key) {
        case 'z':
          // Z to half
          selectedMapTileInfo.half = !selectedMapTileInfo.half;
          mapQueueDataDispatch({
            type: 'change',
            x: selectedMapTileInfo.x,
            y: selectedMapTileInfo.y,
            className: '',
            half: !selectedMapTileInfo.half,
          });
          break;
        case 'e':
          // E to pop_back
          route = attackQueueRef.current.pop_back();
          if (route) {
            setSelectedMapTileInfo({
              ...selectedMapTileInfo,
              x: route.from.x,
              y: route.from.y,
              //  todo: fix half/unitsCount logic
            });
          }
          break;
        case 'q':
          // Q to clear
          route = attackQueueRef.current.front();
          if (route) {
            attackQueueRef.current.clear();
            setSelectedMapTileInfo({
              ...selectedMapTileInfo,
              x: route.from.x,
              y: route.from.y,
            });
          }
          break;
        case 'g':
          // G to select king
          if (initGameInfo) {
            setSelectedMapTileInfo({
              ...selectedMapTileInfo,
              x: initGameInfo.king.x,
              y: initGameInfo.king.y,
            });
          }
          break;
        case 'a':
        case 'ArrowLeft': // 37 Left
          // todo 这里 x y 方向相反
          newPoint = {
            x: selectedMapTileInfo.x,
            y: selectedMapTileInfo.y - 1,
          };
          handlePositionChange(newPoint, 'queue_left');
          break;
        case 'w':
        case 'ArrowUp': // 38 Up
          event.preventDefault();
          newPoint = {
            x: selectedMapTileInfo.x - 1,
            y: selectedMapTileInfo.y,
          };
          handlePositionChange(newPoint, 'queue_up');
          break;
        case 'd':
        case 'ArrowRight': // 39 Right
          newPoint = {
            x: selectedMapTileInfo.x,
            y: selectedMapTileInfo.y + 1,
          };
          handlePositionChange(newPoint, 'queue_right');
          break;
        case 's':
        case 'ArrowDown': // 40 Down
          event.preventDefault();
          newPoint = {
            x: selectedMapTileInfo.x + 1,
            y: selectedMapTileInfo.y,
          };
          handlePositionChange(newPoint, 'queue_down');
          break;
      }
    },
    [
      handlePositionChange,
      mapQueueDataDispatch,
      selectedMapTileInfo,
      attackQueueRef,
      setSelectedMapTileInfo,
      initGameInfo,
      setZoom,
    ]
  );

  useEffect(() => {
    const mapNode = mapRef.current;
    if (mapNode) {
      // mapNode.focus(); // todo: enable with OnBlur will cause `Maximum update depth exceeded error`
      mapNode.addEventListener('keydown', handleKeyDown);
      return () => {
        mapNode.removeEventListener('keydown', handleKeyDown);
      };
    }
    return () => {};
  }, [mapRef, handleKeyDown]);

  const getPlayerIndex = useCallback((room: Room, playerId: string) => {
    for (let i = 0; i < room.players.length; ++i) {
      if (room.players[i].id === playerId) {
        return i;
      }
    }
    return -1;
  }, []);

  const myPlayerIndex = useMemo(() => {
    return getPlayerIndex(room, myPlayerId);
  }, [room, myPlayerId, getPlayerIndex]);

  const queueEmpty = mapQueueData.length === 0;

  let displayMapData = mapData.map((tiles, x) => {
    return tiles.map((tile, y) => {
      const [tileType, color, unitsCount] = tile;
      const isOwned = color === room.players[myPlayerIndex].color;
      const _className = queueEmpty ? '' : mapQueueData[x][y].className;

      let tileHalf = false;

      if (selectedMapTileInfo.x === x && selectedMapTileInfo.y === y) {
        tileHalf = selectedMapTileInfo.half;
      } else if (mapQueueData.length !== 0 && mapQueueData[x][y].half) {
        tileHalf = true;
      } else {
        tileHalf = false;
      }
      const isSelected =
        x === selectedMapTileInfo.x && y === selectedMapTileInfo.y;

      const isNextPossibleMapPosition = Object.values(
        possibleNextMapPositions
      ).some((p) => {
        return p && p.x === x && p.y === y;
      });

      const isNextPossibleMove =
        isNextPossibleMapPosition && tileType !== TileType.Mountain;

      const getPossibleMoveDirection = () => {
        if (isNextPossibleMove) {
          const { bottom, left, right } = possibleNextMapPositions;
          if (bottom && bottom.x === x && bottom.y === y) return 'down';
          if (left && left.x === x && left.y === y) return 'left';
          if (right && right.x === x && right.y === y) return 'right';
          return 'up';
        }
        return '';
      };
      const moveDirection = getPossibleMoveDirection();

      return {
        tile,
        isOwned,
        _className,
        tileHalf,
        isSelected,
        selectRef,
        isNextPossibleMove,
        moveDirection,
      };
    });
  });

  return (
    <div
      ref={mapRef}
      tabIndex={0}
      onBlur={() => {
        setSelectedMapTileInfo({ x: -1, y: -1, half: false, unitsCount: 0 });
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        width: mapPixelWidth,
        height: mapPixelHeight,
      }}
    >
      {displayMapData.map((tiles, x) => {
        return tiles.map((tile, y) => {
          return (
            <MapTile
              key={`${x}/${y}`}
              zoom={zoom}
              size={tileSize}
              x={x}
              y={y}
              {...tile}
              attackQueueRef={attackQueueRef}
              setSelectedMapTileInfo={setSelectedMapTileInfo}
              mapQueueDataDispatch={mapQueueDataDispatch}
            />
          );
        });
      })}
    </div>
  );
}

export default GameMap;
