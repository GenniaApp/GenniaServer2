import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import usePossibleNextMapPositions from '@/lib/use-possible-next-map-positions';
import { useGame, useGameDispatch } from '@/context/GameContext';
import MapTile from './MapTile';
import { TileType, Room, Route, Position } from '@/lib/types';
import useMap from '@/hooks/useMap';
import { getPlayerIndex } from '@/lib/utils';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import ClearIcon from '@mui/icons-material/Clear';
import UndoIcon from '@mui/icons-material/Undo';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ZoomInMap, ZoomOutMap } from '@mui/icons-material';
import useMediaQuery from '@mui/material/useMediaQuery';

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

  const { t } = useTranslation();

  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const touchAttacking = useRef(false);
  const lastTouchPosition = useRef({ x: -1, y: -1 });

  const touchDragging = useRef(false);
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const initialDistance = useRef(0);
  const lastTouchTime = useRef(0);
  const touchHalf = useRef(false);
  const [showDirections, setShowDirections] = useState(false);

  const toggleDirections = () => {
    setShowDirections(!showDirections);
  };

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

  const halfArmy = useCallback(() => {
    if (selectRef.current) {
      let selectPos = selectRef.current;
      if (selectPos.x === -1 || selectPos.y === -1) return;
      touchHalf.current = !touchHalf.current; // todo: potential bug
      setSelectedMapTileInfo({
        x: selectPos.x,
        y: selectPos.y,
        half: touchHalf.current,
        unitsCount: 0,
      });
      mapQueueDataDispatch({
        type: 'change',
        x: selectPos.x,
        y: selectPos.y,
        className: '',
        half: touchHalf.current,
      });
    }
  }, [mapQueueDataDispatch]);

  const selectGeneral = useCallback(() => {
    if (initGameInfo && selectRef.current) {
      const { king } = initGameInfo;
      setSelectedMapTileInfo({ ...selectRef.current, x: king.x, y: king.y });
    }
  }, [initGameInfo, setPosition]);

  const centerGeneral = useCallback(() => {
    if (initGameInfo) {
      const { king } = initGameInfo;
      const pixel_x = Math.floor(mapPixelWidth / 2 - king.x * zoom * tileSize);
      const pixel_y = Math.floor(mapPixelHeight / 2 - king.y * zoom * tileSize);
      setPosition({ x: pixel_y, y: pixel_x });
    }
  }, [
    initGameInfo,
    mapPixelHeight,
    mapPixelWidth,
    zoom,
    tileSize,
    setPosition,
  ]);

  // useEffect(() => {
  //   if (isSmallScreen) {
  //     centerGeneral();
  //   }
  // }, [isSmallScreen, centerGeneral]);

  const popQueue = useCallback(() => {
    if (selectRef.current) {
      let route = attackQueueRef.current.pop_back();
      if (route) {
        setSelectedMapTileInfo({
          ...selectRef.current,
          x: route.from.x,
          y: route.from.y,
          //  todo: fix half/unitsCount logic
        });
      }
    }
  }, []);
  const clearQueue = useCallback(() => {
    if (selectRef.current) {
      let route = attackQueueRef.current.front();
      if (route) {
        attackQueueRef.current.clear();
        setSelectedMapTileInfo({
          ...selectRef.current,
          x: route.from.x,
          y: route.from.y,
        });
      }
    }
  }, []);
  const attackUp = useCallback(() => {
    if (selectRef.current) {
      let selectPos = selectRef.current;
      let newPoint = {
        x: selectPos.x - 1,
        y: selectPos.y,
      };
      handlePositionChange(newPoint, 'queue_up');
    }
  }, []);
  const attackDown = useCallback(() => {
    if (selectRef.current) {
      let selectPos = selectRef.current;

      let newPoint = {
        x: selectPos.x + 1,
        y: selectPos.y,
      };
      handlePositionChange(newPoint, 'queue_down');
    }
  }, []);
  const attackLeft = useCallback(() => {
    if (selectRef.current) {
      let selectPos = selectRef.current;
      let newPoint = {
        x: selectPos.x,
        y: selectPos.y - 1,
      };
      handlePositionChange(newPoint, 'queue_left');
    }
  }, []);
  const attackRight = useCallback(() => {
    if (selectRef.current) {
      let selectPos = selectRef.current;

      let newPoint = {
        x: selectPos.x,
        y: selectPos.y + 1,
      };
      handlePositionChange(newPoint, 'queue_right');
    }
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      handleZoomOption(event.key);
      switch (event.key) {
        case 'z':
          halfArmy();
          break;
        case 'e':
          popQueue();
          break;
        case 'q':
          clearQueue();
          break;
        case 'g':
          selectGeneral();
          break;
        case 'c':
          setPosition({ x: 0, y: 0 });
          break;
        case 'h': // home
          centerGeneral();
          break;
        case 'a':
        case 'ArrowLeft': // 37 Left
          event.preventDefault();
          attackLeft();
          break;
        case 'w':
        case 'ArrowUp': // 38 Up
          event.preventDefault();
          attackUp();
          break;
        case 'd':
        case 'ArrowRight': // 39 Right
          event.preventDefault();
          attackRight();
          break;
        case 's':
        case 'ArrowDown': // 40 Down
          event.preventDefault();
          attackDown();
          break;
      }
    },
    [handleZoomOption]
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
          const currentTime = new Date().getTime();
          if (!isOwned) {
            touchDragging.current = true;
            touchStartPosition.current = {
              x: event.touches[0].clientX - position.x,
              y: event.touches[0].clientY - position.y,
            };
            // console.log('touch drag at ', x, y);
          } else {
            touchAttacking.current = true;
            if (
              lastTouchPosition.current.x === x &&
              lastTouchPosition.current.y === y &&
              currentTime - lastTouchTime.current <= 400 // quick double touch 400ms
            ) {
              touchHalf.current = !touchHalf.current;
            }
            setSelectedMapTileInfo({
              x,
              y,
              half: touchHalf.current,
              unitsCount: 0,
            });
            lastTouchPosition.current = { x, y };
            lastTouchTime.current = currentTime;
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
    (event: TouchEvent) => {
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
          if (!mapData) return;
          if (mapData.length === 0) return;
          const [tileType, color] = mapData[x][y];
          // check tileType
          if (
            tileType === TileType.Mountain ||
            tileType === TileType.Obstacle
          ) {
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
          touchHalf.current = false;
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
    },
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

  const handleTouchEnd = useCallback((event: TouchEvent) => {
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
    <div>
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
          width: mapPixelHeight, // game's width and height are swapped
          height: mapPixelWidth,
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
      {isSmallScreen && (
        <Box
          className='menu-container'
          sx={{
            margin: 0,
            padding: '5px',
            position: 'absolute',
            left: '5px',
            bottom: { xs: '65px', md: '80px' },
            display: 'flex',
            justifyContent: 'space-between',
            alignContent: 'space-between',
            alignItems: 'center',
            flexDirection: 'column',
            zIndex: 1000,
            boxShadow: '2',
          }}
        >
          <Tooltip title={t('howToPlay.centerGeneral')} placement='top'>
            <IconButton onClick={centerGeneral}>
              <HomeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('howToPlay.undoMove')} placement='top'>
            <IconButton onClick={popQueue}>
              <UndoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('howToPlay.clearQueuedMoves')} placement='top'>
            <IconButton onClick={clearQueue}>
              <ClearIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('howToPlay.toggle50')} placement='top'>
            <IconButton onClick={halfArmy}>
              <Typography>50%</Typography>
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={() => {
              setZoom((z) => z - 0.2);
            }}
          >
            <ZoomInMap />
          </IconButton>
          <IconButton
            onClick={() => {
              setZoom((z) => z + 0.2);
            }}
          >
            <ZoomOutMap />
          </IconButton>
          <Tooltip title={t('expandWASD')} placement='top'>
            <IconButton onClick={toggleDirections}>
              {showDirections ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {showDirections && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '5px',
            position: 'absolute',
            right: '10px',
            bottom: { xs: '65px', md: '80px' },
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <IconButton onClick={attackUp} className='attack-button'>
              <ArrowUpwardIcon />
            </IconButton>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: {
                  xs: '40vw',
                  md: '20vw',
                  lg: '20vw',
                },
                justifyContent: 'space-between',
              }}
            >
              <IconButton onClick={attackLeft} className='attack-button'>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={attackRight} className='attack-button'>
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            <IconButton onClick={attackDown} className='attack-button'>
              <ArrowDownwardIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </div>
  );
}

export default GameMap;
