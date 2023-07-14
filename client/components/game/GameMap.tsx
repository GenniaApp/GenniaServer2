import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import usePossibleNextMapPositions from '@/lib/use-possible-next-map-positions';
import { useGame, useGameDispatch } from '@/context/GameContext';
import MapTile from './MapTile';

import { Route, Position } from '@/lib/types';

function GameMap() {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const {
    attackQueueRef,
    room,
    mapData,
    selectedMapTileInfo,
    playerPrivateInfo,
  } = useGame();
  const { setSelectedMapTileInfo, mapQueueDataDispatch } = useGameDispatch();
  const mapRef = useRef<HTMLDivElement>(null);
  const timeoutId = useRef<number | undefined>(undefined);

  // init when GameStarted
  useEffect(() => {
    if (!room.map) return;
    if (!room.gameStarted) return;

    console.log(
      `init mapQueueData: width=${room.map.width}, height=${room.map.height}`
    );

    setSelectedMapTileInfo({
      x: -1,
      y: -1,
      half: false,
      unitsCount: 0,
    });

    mapQueueDataDispatch({
      type: 'init',
      width: room.map.width,
      height: room.map.height,
    });
  }, [room, mapQueueDataDispatch]);

  const withinMap = useCallback(
    (point: Position) => {
      if (!room.map) return false;
      return (
        0 <= point.x &&
        point.x < room.map.width &&
        0 <= point.y &&
        point.y < room.map.height
      );
    },
    [room]
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
    [selectedMapTileInfo, withinMap, attackQueueRef]
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      setDragging(true);
      setStartPosition({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (dragging && mapRef.current) {
        setPosition({
          x: event.clientX - startPosition.x,
          y: event.clientY - startPosition.y,
        });
      }
    },
    [dragging, mapRef, startPosition]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      setStartPosition({
        x: event.targetTouches[0].clientX - position.x,
        y: event.targetTouches[0].clientY - position.y,
      });
    },
    [position]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (mapRef.current) {
        setPosition({
          x: event.targetTouches[0].clientX - startPosition.x,
          y: event.targetTouches[0].clientY - startPosition.y,
        });
      }
    },
    [mapRef, startPosition]
  );

  const [zoom, setZoom] = useState(1);
  const [tileSize, setTileSize] = useState(50);

  const mapPixelWidth = useMemo(
    () => tileSize * (room.map ? room.map.width : 0),
    [tileSize, room]
  );
  const mapPixelHeight = useMemo(
    () => tileSize * (room.map ? room.map.width : 0),
    [tileSize, room]
  );

  const possibleNextMapPositions = usePossibleNextMapPositions({
    width: room.map ? room.map.width : 0,
    height: room.map ? room.map.height : 0,
    selectedMapTileInfo,
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      console.log('keydown: ', event.key);
      switch (event.key) {
        case '1':
          setZoom(0.7);
          break;
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
          if (selectedMapTileInfo.half) {
            // 已经 half 则 取消 half
            selectedMapTileInfo.half = false;
            mapQueueDataDispatch({
              type: 'change',
              x: selectedMapTileInfo.x,
              y: selectedMapTileInfo.y,
              className: '',
              text: selectedMapTileInfo.unitsCount, // 还原回原来的 unit? todo
            });
          } else {
            selectedMapTileInfo.half = true;
            mapQueueDataDispatch({
              type: 'change',
              x: selectedMapTileInfo.x,
              y: selectedMapTileInfo.y,
              className: '',
              text: '50%',
            });
          }
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
          if (playerPrivateInfo) {
            setSelectedMapTileInfo({
              ...selectedMapTileInfo,
              x: playerPrivateInfo.king.x,
              y: playerPrivateInfo.king.y,
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
    ]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      if (timeoutId.current !== undefined) {
        window.clearTimeout(timeoutId.current);
      }
      timeoutId.current = window.setTimeout(() => {
        const newZoom = zoom + event.deltaY * -0.0008;
        console.log(event.deltaY, zoom, newZoom);
        setZoom(newZoom);
        timeoutId.current = undefined;
      }, 50);
    },
    [zoom, timeoutId]
  );

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.addEventListener('wheel', handleWheel, { passive: false });
      mapRef.current.addEventListener('keydown', handleKeyDown);
      mapRef.current.addEventListener('mousedown', handleMouseDown);
      mapRef.current.addEventListener('mousemove', handleMouseMove);
      mapRef.current.addEventListener('mouseup', handleMouseUp);
      mapRef.current.addEventListener('touchstart', handleTouchStart);
      mapRef.current.addEventListener('touchmove', handleTouchMove);
      return () => {
        if (mapRef.current) {
          mapRef.current.removeEventListener('wheel', handleWheel);
          mapRef.current.removeEventListener('keydown', handleKeyDown);
          mapRef.current.removeEventListener('mousedown', handleMouseDown);
          mapRef.current.removeEventListener('mousemove', handleMouseMove);
          mapRef.current.removeEventListener('mouseup', handleMouseUp);
          mapRef.current.removeEventListener('touchstart', handleTouchStart);
          mapRef.current.removeEventListener('touchmove', handleTouchMove);
        }
      };
    }
  }, [
    mapRef,
    handleKeyDown,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
  ]);

  return (
    <div
      ref={mapRef}
      tabIndex={0}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
        width: mapPixelWidth,
        height: mapPixelHeight,
      }}
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
              possibleNextMapPositions={possibleNextMapPositions}
            />
          );
        });
      })}
    </div>
  );
}

export default GameMap;
