import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import usePossibleNextMapPositions from '@/lib/use-possible-next-map-positions';
import { useGame, useGameDispatch } from '@/context/GameContext';
import MapTile from './MapTile';
import { TileType, Room, Route, Position } from '@/lib/types';
import useMap from '@/hooks/useMap';
import { debounce } from 'lodash';
import { getPlayerIndex } from '@/lib/utils';

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

  const touchAttacking = useRef(false);
  const lastTouchPosition = useRef({ x: -1, y: -1 });

  const touchDragging = useRef(false);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const initialDistance = useRef(0);

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
    setPosition,
  } = useMap({
    mapWidth: initGameInfo ? initGameInfo.mapWidth : 0,
    mapHeight: initGameInfo ? initGameInfo.mapHeight : 0,
    listenTouch: false, // implement touch later
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
      selectRef,
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

  const myPlayerIndex = useMemo(() => {
    return getPlayerIndex(room, myPlayerId);
  }, [room.players, myPlayerId, getPlayerIndex]);

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

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();

      if (event.touches.length === 1) {
        // touch drag or touch attack
        if (mapRef.current) {
          const touch = event.touches[0];
          const rect = mapRef.current.getBoundingClientRect();
          const y = Math.floor((touch.clientX - rect.left) / (tileSize * zoom));
          const x = Math.floor((touch.clientY - rect.top) / (tileSize * zoom));
          const [tileType, color] = mapData[x][y];
          const isOwned = color === room.players[myPlayerIndex].color;
          if (!isOwned) {
            touchDragging.current = true;
            touchStartPosition.current = {
              x: event.touches[0].clientX - position.x,
              y: event.touches[0].clientY - position.y,
            };
            // console.log('touch drag at ', x, y);
          } else {
            touchAttacking.current = true;
            setSelectedMapTileInfo({ x, y, half: false, unitsCount: 0 });
            // console.log('touch attack at ', x, y);
          }
        }
      } else if (event.touches.length === 2) {
        // zoom
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch1.clientX - touch2.clientX, 2) +
            Math.pow(touch1.clientY - touch2.clientY, 2)
        );
        initialDistance.current = distance;
      }
    },
    [tileSize, mapRef, mapData, room, myPlayerIndex, position]
  );

  const handleTouchMove = useCallback(
    debounce((event: TouchEvent) => {
      event.preventDefault();

      if (event.touches.length === 1) {
        if (touchDragging.current) {
          const updatePosition = () => {
            setPosition({
              x: event.touches[0].clientX - touchStartPosition.current.x,
              y: event.touches[0].clientY - touchStartPosition.current.y,
            });
          };
          requestAnimationFrame(updatePosition);
        }

        if (touchAttacking.current && mapRef.current) {
          const touch = event.touches[0];
          const rect = mapRef.current.getBoundingClientRect();
          const y = Math.floor((touch.clientX - rect.left) / (tileSize * zoom));
          const x = Math.floor((touch.clientY - rect.top) / (tileSize * zoom));

          const dx = x - selectRef.current.x;
          const dy = y - selectRef.current.y;
          // check if newPosition is valid
          if (
            (dx === 0 && dy === 0) ||
            (x === lastTouchPosition.current.x &&
              y === lastTouchPosition.current.y)
          ) {
            return;
          }
          const [tileType, color] = mapData[x][y];
          // check tileType
          if (
            tileType === TileType.Mountain ||
            tileType === TileType.Obstacle
          ) {
            touchAttacking.current = false;
            return;
          }
          // check neighbor
          let direction = '';
          if (dy === 1 && dx === 0) {
            direction = 'right';
          } else if (dy === -1 && dx === 0) {
            direction = 'left';
          } else if (dy === 0 && dx === 1) {
            direction = 'down';
          } else if (dy === 0 && dx === -1) {
            direction = 'up';
          } else {
            // not valid move
            touchAttacking.current = false;
            return;
          }
          // console.log('valid touch move attack', x, y, className);
          const newPoint = { x, y };
          handlePositionChange(newPoint, `queue_${direction}`);
          lastTouchPosition.current = newPoint;
        }
      } else if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch1.clientX - touch2.clientX, 2) +
            Math.pow(touch1.clientY - touch2.clientY, 2)
        );
        const delta = distance - initialDistance.current;
        const newZoom = Math.min(Math.max(zoom + delta * 0.0002, 0.2), 4.0);
        setZoom(newZoom);
      }
    }, 10), // debounce in millisecond to avoid too many calls
    [
      tileSize,
      mapRef,
      selectRef,
      lastTouchPosition,
      mapData,
      room,
      myPlayerIndex,
      handlePositionChange,
      initialDistance,
      touchStartPosition,
      zoom,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    touchAttacking.current = false;
    touchDragging.current = false;
  }, []);

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

  useEffect(() => {
    const mapNode = mapRef.current;
    if (mapNode) {
      mapNode.addEventListener('touchstart', handleTouchStart, {
        passive: false,
      });
      mapNode.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      mapNode.addEventListener('touchend', handleTouchEnd);
      return () => {
        mapNode.removeEventListener('touchstart', handleTouchStart);
        mapNode.removeEventListener('touchmove', handleTouchMove);
        mapNode.removeEventListener('touchend', handleTouchEnd);
      };
    }
    return () => {};
  }, [mapRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

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
      {/* map key (x,y) example */}
      {/* 0,0 / 0, 1 */}
      {/* 1,0 / 1, 1 */}
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
              warringStatesMode={room.warringStatesMode}
            />
          );
        });
      })}
    </div>
  );
}

export default GameMap;
