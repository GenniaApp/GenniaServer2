import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import usePossibleNextMapPositions from '@/lib/use-possible-next-map-positions';
import { useGame, useGameDispatch } from '@/context/GameContext';
import MapTile from './MapTile';
import { TileType, Room, Route, Position } from '@/lib/types';
import useMap from '@/hooks/useMap';

function GameMap() {
  const {
    attackQueueRef,
    socketRef,
    room,
    mapData,
    myPlayerId,
    mapQueueData,
    selectedMapTileInfo,
    initGameInfo,
    turnsCount,
  } = useGame();

  const { setSelectedMapTileInfo, mapQueueDataDispatch } = useGameDispatch();
  const selectRef = useRef<any>(null);
  // todo: selectedMapTileInfo is a often change value, use ref to sync update to prevent rerender, not sure if it's a good idea

  const {
    tileSize,
    position,
    mapRef,
    mapPixelWidth,
    mapPixelHeight,
    zoom,
    setZoom,
    handleZoomOption,
  } = useMap({
    mapWidth: initGameInfo ? initGameInfo.mapWidth : 0,
    mapHeight: initGameInfo ? initGameInfo.mapHeight : 0,
  });

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
      let selectPos = selectRef.current;
      if (withinMap(newPoint)) {
        attackQueueRef.current.insert({
          from: selectPos,
          to: newPoint,
          half: selectPos.half,
        });
        setSelectedMapTileInfo({
          // ...selectPos,
          x: newPoint.x,
          y: newPoint.y,
          half: false,
          unitsCount: 0,
        });
        mapQueueDataDispatch({
          type: 'change',
          x: selectPos.x,
          y: selectPos.y,
          className: className,
        });
        if (attackQueueRef.current.allowAttackThisTurn) {
          let item = attackQueueRef.current.pop();
          socketRef.current.emit('attack', item.from, item.to, item.half);
          attackQueueRef.current.allowAttackThisTurn = false;
          console.log(
            `emit attack: `,
            item.from,
            item.to,
            item.half,
            turnsCount
          );
        }
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

  const possibleNextMapPositions = usePossibleNextMapPositions({
    width: room.map ? room.map.width : 0,
    height: room.map ? room.map.height : 0,
    selectedMapTileInfo,
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      handleZoomOption(event.key);

      let newPoint = { x: -1, y: -1 };
      let route: Route | undefined;

      let selectPos = selectRef.current;

      if (!selectPos) return;
      switch (event.key) {
        case 'z':
          // Z to half
          selectPos.half = !selectPos.half;
          mapQueueDataDispatch({
            type: 'change',
            x: selectPos.x,
            y: selectPos.y,
            className: '',
            half: !selectPos.half,
          });
          break;
        case 'e':
          // E to pop_back
          route = attackQueueRef.current.pop_back();
          if (route) {
            setSelectedMapTileInfo({
              ...selectPos,
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
              ...selectPos,
              x: route.from.x,
              y: route.from.y,
            });
          }
          break;
        case 'g':
          // G to select king
          if (initGameInfo) {
            setSelectedMapTileInfo({
              ...selectPos,
              x: initGameInfo.king.x,
              y: initGameInfo.king.y,
            });
          }
          break;
        case 'a':
        case 'ArrowLeft': // 37 Left
          // todo 这里 x y 方向相反
          event.preventDefault();
          newPoint = {
            x: selectPos.x,
            y: selectPos.y - 1,
          };
          handlePositionChange(newPoint, 'queue_left');
          break;
        case 'w':
        case 'ArrowUp': // 38 Up
          event.preventDefault();
          newPoint = {
            x: selectPos.x - 1,
            y: selectPos.y,
          };
          handlePositionChange(newPoint, 'queue_up');
          break;
        case 'd':
        case 'ArrowRight': // 39 Right
          event.preventDefault();
          newPoint = {
            x: selectPos.x,
            y: selectPos.y + 1,
          };
          handlePositionChange(newPoint, 'queue_right');
          break;
        case 's':
        case 'ArrowDown': // 40 Down
          event.preventDefault();
          newPoint = {
            x: selectPos.x + 1,
            y: selectPos.y,
          };
          handlePositionChange(newPoint, 'queue_down');
          break;
      }
    },
    [
      handlePositionChange,
      mapQueueDataDispatch,
      selectRef,
      attackQueueRef,
      setSelectedMapTileInfo,
      initGameInfo,
      setZoom,
    ]
  );

  useEffect(() => {
    const mapNode = mapRef.current;
    if (mapNode) {
      mapNode.focus();
      mapNode.addEventListener('keydown', handleKeyDown);
      return () => {
        mapNode.removeEventListener('keydown', handleKeyDown);
      };
    }
    return () => {};
  }, [mapRef]);

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
