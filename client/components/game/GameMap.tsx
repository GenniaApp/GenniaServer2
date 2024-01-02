import { useGame, useGameDispatch } from '@/context/GameContext';
import useMap from '@/hooks/useMap';
import { Position, SelectedMapTileInfo, TileProp, TileType } from '@/lib/types';
import usePossibleNextMapPositions from '@/lib/use-possible-next-map-positions';
import { getPlayerIndex } from '@/lib/utils';
import { ZoomInMap, ZoomOutMap } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearIcon from '@mui/icons-material/Clear';
import HomeIcon from '@mui/icons-material/Home';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'next-i18next';
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapTile from './MapTile';
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
    (selectPos: SelectedMapTileInfo, newPoint: Position, className: string) => {
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
        // todo: Higher latency can result in attacks from one turn not being responded to by the server until the next turn,
        // resulting in two attack requests in one turn, causing the 2nd attack to fail
        //
        // if (attackQueueRef.current.allowAttackThisTurn) {
        //   let item = attackQueueRef.current.pop();
        //   socketRef.current.emit('attack', item.from, item.to, item.half);
        //   attackQueueRef.current.allowAttackThisTurn = false;
        //   console.log(
        //     `emit attack: `,
        //     item.from,
        //     item.to,
        //     item.half,
        //     turnsCount
        //   );
        // }
      } else {
        console.log("new point not within map", newPoint)
      }
    },
    [
      withinMap,
      attackQueueRef,
      mapQueueDataDispatch,
      setSelectedMapTileInfo,
    ]
  );

  const possibleNextMapPositions = usePossibleNextMapPositions({
    width: room.map ? room.map.width : 0,
    height: room.map ? room.map.height : 0,
    selectedMapTileInfo: selectedMapTileInfo ? { x: selectedMapTileInfo.x, y: selectedMapTileInfo.y } : undefined,
  });

  const halfArmy = useCallback(() => {
    if (selectedMapTileInfo) {
      let selectPos = selectedMapTileInfo;
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
  }, [mapQueueDataDispatch, selectedMapTileInfo, setSelectedMapTileInfo]);

  const selectGeneral = useCallback(() => {
    if (initGameInfo && selectedMapTileInfo) {
      const { king } = initGameInfo;
      setSelectedMapTileInfo({ ...selectedMapTileInfo, x: king.x, y: king.y });
    }
  }, [initGameInfo, selectedMapTileInfo, setSelectedMapTileInfo]);

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
    if (selectedMapTileInfo) {
      let route = attackQueueRef.current.pop_back();
      if (route) {
        setSelectedMapTileInfo({
          ...selectedMapTileInfo,
          x: route.from.x,
          y: route.from.y,
          //  todo: fix half/unitsCount logic
        });
      }
    }
  }, [attackQueueRef, selectedMapTileInfo, setSelectedMapTileInfo]);
  const clearQueue = useCallback(() => {
    if (selectedMapTileInfo) {
      let route = attackQueueRef.current.front();
      if (route) {
        attackQueueRef.current.clear();
        setSelectedMapTileInfo({
          ...selectedMapTileInfo,
          x: route.from.x,
          y: route.from.y,
        });
      }
    }
  }, [attackQueueRef, selectedMapTileInfo, setSelectedMapTileInfo]);
  const attackUp = useCallback((selectPos?: SelectedMapTileInfo) => {
    if (selectPos) {
      let newPoint = {
        x: selectPos.x - 1,
        y: selectPos.y,
      };
      handlePositionChange(selectPos, newPoint, 'queue_up');
    }
  }, [handlePositionChange]);
  const attackDown = useCallback((selectPos?: SelectedMapTileInfo) => {
    if (selectPos) {
      let newPoint = {
        x: selectPos.x + 1,
        y: selectPos.y,
      };
      handlePositionChange(selectPos, newPoint, 'queue_down');
    }
  }, [handlePositionChange]);
  const attackLeft = useCallback((selectPos?: SelectedMapTileInfo) => {
    if (selectPos) {
      let newPoint = {
        x: selectPos.x,
        y: selectPos.y - 1,
      };
      handlePositionChange(selectPos, newPoint, 'queue_left');
    }
  }, [handlePositionChange])
  const attackRight = useCallback((selectPos?: SelectedMapTileInfo) => {
    if (selectPos) {
      let newPoint = {
        x: selectPos.x,
        y: selectPos.y + 1,
      };
      handlePositionChange(selectPos, newPoint, 'queue_right');
    }
  }, [handlePositionChange]);

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
          attackLeft(selectedMapTileInfo);
          break;
        case 'w':
        case 'ArrowUp': // 38 Up
          event.preventDefault();
          attackUp(selectedMapTileInfo);
          break;
        case 'd':
        case 'ArrowRight': // 39 Right
          event.preventDefault();
          attackRight(selectedMapTileInfo);
          break;
        case 's':
        case 'ArrowDown': // 40 Down
          event.preventDefault();
          attackDown(selectedMapTileInfo);
          break;
      }
    },
    [attackDown, attackLeft, attackRight, attackUp, centerGeneral, clearQueue, halfArmy, handleZoomOption, popQueue, selectGeneral, selectedMapTileInfo, setPosition]
  );

  const myPlayerIndex = useMemo(() => {
    return getPlayerIndex(room, myPlayerId);
  }, [room, myPlayerId]);

  const queueEmpty = mapQueueData.length === 0;

  let displayMapData = mapData.map((tiles, x) => {
    return tiles.map((tile, y) => {
      const [, color] = tile;
      const isOwned = color === room.players[myPlayerIndex].color;
      const _className = queueEmpty ? '' : mapQueueData[x][y].className;

      let tileHalf = false;

      const getIsSelected = () => {
        if (!selectedMapTileInfo) {
          return false;
        }

        if (selectedMapTileInfo.x === x && selectedMapTileInfo.y === y) {
          tileHalf = selectedMapTileInfo.half;
        } else if (mapQueueData.length !== 0 && mapQueueData[x][y].half) {
          tileHalf = true;
        } else {
          tileHalf = false;
        }
        const isSelected = x === selectedMapTileInfo.x && y === selectedMapTileInfo.y;
        return isSelected;
      }
      const isSelected = getIsSelected();

      return {
        tile,
        isOwned,
        _className,
        tileHalf,
        isSelected,
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
    [mapRef, tileSize, zoom, mapData, room.players, myPlayerIndex, position.x, position.y, setSelectedMapTileInfo]
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

          const dx = x - selectedMapTileInfo.x;
          const dy = y - selectedMapTileInfo.y;
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
          handlePositionChange(selectedMapTileInfo, newPoint, `queue_${direction}`);
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
    [mapRef, setPosition, tileSize, zoom, selectedMapTileInfo, mapData, handlePositionChange, setZoom]
  );

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    touchAttacking.current = false;
    touchDragging.current = false;
  }, []);

  const testIfNextPossibleMove = useCallback((tileType: TileType, x: number, y: number) => {
    const isNextPossibleMapPosition = Object.values(
      possibleNextMapPositions
    ).some((p) => {
      return p && p.x === x && p.y === y;
    });

    return isNextPossibleMapPosition && tileType !== TileType.Mountain;
  }, [possibleNextMapPositions])

  const handleClick = useCallback((tile: TileProp, x: number, y: number) => {
    const [tileType, color, unitsCount] = tile;
    const isOwned = color === room.players[myPlayerIndex].color;

    let tileHalf = false;

    if (selectedMapTileInfo.x === x && selectedMapTileInfo.y === y) {
      tileHalf = selectedMapTileInfo.half;
    } else if (mapQueueData.length !== 0 && mapQueueData[x][y].half) {
      tileHalf = true;
    } else {
      tileHalf = false;
    }

    const isNextPossibleMove = testIfNextPossibleMove(tileType, x, y)

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

    if (isNextPossibleMove) {
      handlePositionChange(selectedMapTileInfo, { x, y }, `queue_${moveDirection}`);
    } else if (isOwned) {
      if (selectedMapTileInfo.x === x && selectedMapTileInfo.y === y) {
        console.log(
          'Clicked on the current tile, changing tile half state to',
          !tileHalf
        );
        setSelectedMapTileInfo({
          x,
          y,
          half: !tileHalf,
          unitsCount: unitsCount,
        });
      } else {
        setSelectedMapTileInfo({ x, y, half: false, unitsCount: unitsCount });
      }
    } else {
      setSelectedMapTileInfo({ x: -1, y: -1, half: false, unitsCount: 0 });
      mapQueueDataDispatch({
        type: 'change',
        x: x,
        y: y,
        className: '',
        half: false,
      });
    }
  }, [room.players, myPlayerIndex, selectedMapTileInfo, mapQueueData, testIfNextPossibleMove, possibleNextMapPositions, handlePositionChange, setSelectedMapTileInfo, mapQueueDataDispatch]);

  useEffect(() => {
    const mapNode = mapRef.current;
    if (mapNode) {
      mapNode.focus();
      mapNode.addEventListener('keydown', handleKeyDown);
      return () => {
        mapNode.removeEventListener('keydown', handleKeyDown);
      };
    }
    return () => { };
  }, [handleKeyDown, mapRef]);

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
    return () => { };
  }, [mapRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div>
      <div
        ref={mapRef}
        tabIndex={0}
        onBlur={() => {
          // TODO: inifite re-render loop. 
          // when surrender or game over dialog is shown. onBlur will execute, it set SelectedMapTile so a re-render is triggered. in the next render, onBlur execute again
          // setSelectedMapTileInfo({ x: -1, y: -1, half: false, unitsCount: 0 });
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
                isNextPossibleMove={testIfNextPossibleMove(tile.tile[0], x, y)}
                handleClick={() => handleClick(tile.tile, x, y)}
                key={`${x}/${y}`}
                zoom={zoom}
                size={tileSize}
                x={x}
                y={y}
                {...tile}
                warringStatesMode={room.warringStatesMode} />
            );
          });
        })}
      </div>
      {isSmallScreen && (
        <Box
          className='menu-container'
          sx={{
            margin: 0,
            padding: '1px !important',
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
              <Typography variant='body2'>50%</Typography>
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
          <Tooltip title={t('expandWSAD')} placement='top'>
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
            <IconButton onClick={() => attackUp(selectedMapTileInfo)} className='attack-button'>
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
              <IconButton onClick={() => attackLeft(selectedMapTileInfo)} className='attack-button'>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={() => attackRight(selectedMapTileInfo)} className='attack-button'>
                <ArrowForwardIcon />
              </IconButton>
            </Box>
            <IconButton onClick={() => attackDown(selectedMapTileInfo)} className='attack-button'>
              <ArrowDownwardIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </div>
  );
}

export default GameMap;
