import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { TileType, TileProp, Position, TileType2Image } from '@/lib/types';
import { ColorArr } from '@/lib/constants';
import { useGame, useGameDispatch } from '@/context/GameContext';
import { Room } from '@/lib/types';
import {
  defaultBgcolor,
  notRevealedFill,
  notOwnedArmyFill,
  notOwnedCityFill,
  MountainFill,
  blankFill,
  selectedStroke,
  revealedStroke,
} from '@/lib/constants';

interface MapTileProps {
  zoom: number;
  imageZoom?: number;
  size: number;
  fontSize?: number;
  onChangeSize?: (size: number) => void;
  tile: TileProp;
  x: number;
  y: number;
  possibleNextMapPositions: {
    top?: Position;
    right?: Position;
    bottom?: Position;
    left?: Position;
  };
}

function MapTile(props: MapTileProps) {
  const {
    zoom,
    imageZoom = 0.8,
    size,
    fontSize = 16,
    x,
    y,
    tile,
    possibleNextMapPositions,
  } = props;

  const [cursorStyle, setCursorStyle] = useState('default');
  const {
    room,
    myPlayerId,
    selectedMapTileInfo,
    mapQueueData,
    attackQueueRef,
  } = useGame();
  const { setSelectedMapTileInfo, mapQueueDataDispatch } = useGameDispatch();

  const [tileType, color, unitsCount] = tile;
  const [tileHalf, setTileHalf] = useState(false);
  const image = TileType2Image[tileType];

  useEffect(() => {
    if (selectedMapTileInfo.x === x && selectedMapTileInfo.y === y) {
      setTileHalf(selectedMapTileInfo.half);
    } else if (mapQueueData.length !== 0 && mapQueueData[x][y].half) {
      setTileHalf(true);
    } else {
      setTileHalf(false);
    }
  }, [selectedMapTileInfo, x, y, mapQueueData]);

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

  const isOwned = useMemo(() => {
    return color === room.players[myPlayerIndex].color;
  }, [myPlayerIndex, color, room]);

  const isNextPossibleMove = useMemo(() => {
    const isNextPossibleMapPosition = Object.values(
      possibleNextMapPositions
    ).some((maybeNextMapPosition) => {
      return (
        maybeNextMapPosition &&
        maybeNextMapPosition.x === x &&
        maybeNextMapPosition.y === y
      );
    });

    return isNextPossibleMapPosition && tileType !== TileType.Mountain;
  }, [possibleNextMapPositions, x, y, tileType]);

  const whichNextPossibleMove = useMemo(() => {
    if (isNextPossibleMove) {
      if (
        possibleNextMapPositions.bottom &&
        possibleNextMapPositions.bottom.x === x &&
        possibleNextMapPositions.bottom.y === y
      )
        return 'down';
      else if (
        possibleNextMapPositions.left &&
        possibleNextMapPositions.left.x === x &&
        possibleNextMapPositions.left.y === y
      )
        return 'left';
      else if (
        possibleNextMapPositions.right &&
        possibleNextMapPositions.right.x === x &&
        possibleNextMapPositions.right.y === y
      )
        return 'right';
      else return 'up';
    } else {
      return '';
    }
  }, [isNextPossibleMove, possibleNextMapPositions, x, y]);

  const isSelected = useMemo(() => {
    return x === selectedMapTileInfo.x && y === selectedMapTileInfo.y;
  }, [selectedMapTileInfo, x, y]);

  const isRevealed = useMemo(() => {
    return unitsCount !== null;
  }, [unitsCount]);

  const stroke = useMemo(() => {
    if (isSelected) {
      return selectedStroke;
    }

    if (isRevealed) {
      return revealedStroke;
    }
  }, [isSelected, isRevealed]);

  const canMove = useMemo(() => {
    return isOwned || isNextPossibleMove;
  }, [isOwned, isNextPossibleMove]);

  const handlePositionChange = useCallback(
    (className: string) => {
      attackQueueRef.current.insert({
        from: selectedMapTileInfo,
        to: { x, y },
        half: selectedMapTileInfo.half,
      });
      setSelectedMapTileInfo({
        // ...selectedMapTileInfo,
        x,
        y,
        half: false,
        unitsCount: 0,
      });
      mapQueueDataDispatch({
        type: 'change',
        x: selectedMapTileInfo.x,
        y: selectedMapTileInfo.y,
        className: className,
      });
    },
    [
      selectedMapTileInfo,
      attackQueueRef,
      mapQueueDataDispatch,
      setSelectedMapTileInfo,
      x,
      y,
    ]
  );

  const handleClick = useCallback(() => {
    if (isNextPossibleMove) {
      handlePositionChange(`queue_${whichNextPossibleMove}`);
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
      // cancel select andhalf
      setSelectedMapTileInfo({ x: -1, y: -1, half: false, unitsCount: 0 });
      mapQueueDataDispatch({
        type: 'change',
        x: x,
        y: y,
        className: '',
        half: false,
      });
    }
  }, [
    x,
    y,
    selectedMapTileInfo,
    unitsCount,
    tileHalf,
    isOwned,
    isNextPossibleMove,
    whichNextPossibleMove,
    handlePositionChange,
    setSelectedMapTileInfo,
    mapQueueDataDispatch,
  ]);

  const handleMouseEnter = useCallback(() => {
    if (canMove) {
      setCursorStyle('pointer');
    }
  }, [canMove]);

  const handleMouseLeave = useCallback(() => {
    if (canMove) {
      setCursorStyle('default');
    }
  }, [canMove]);

  const zoomedSize = useMemo(() => size * zoom, [size, zoom]);
  const zoomedFontSize = useMemo(() => fontSize * zoom, [fontSize, zoom]);
  const tileX = useMemo(() => zoomedSize * y, [zoomedSize, y]);
  const tileY = useMemo(() => zoomedSize * x, [zoomedSize, x]);

  const zoomedImageSize = useMemo(
    () => zoomedSize * imageZoom,
    [zoomedSize, imageZoom]
  );

  const imageXY = useMemo(
    () => (zoomedSize - zoomedImageSize) / 2,
    [zoomedSize, zoomedImageSize]
  );

  const bgcolor = useMemo(() => {
    // 战争迷雾
    if (!isRevealed) {
      return notRevealedFill;
    }
    // 山
    if (tileType === TileType.Mountain) {
      return MountainFill;
    }

    // 玩家单位
    if (color !== null) {
      return ColorArr[color];
    }
    // 中立单位
    if (color === null) {
      if (tileType === TileType.City) {
        return notOwnedCityFill;
      }
      if (unitsCount) {
        return notOwnedArmyFill;
      }
      if (tileType === TileType.Swamp) {
        return notOwnedArmyFill;
      }
    }

    // 空白单位
    return blankFill;
  }, [tileType, color, unitsCount, isRevealed]);

  return (
    <div
      className={mapQueueData.length === 0 ? '' : mapQueueData[x][y].className}
      style={{
        position: 'absolute',
        left: tileX,
        top: tileY,
        width: zoomedSize,
        height: zoomedSize,
        cursor: cursorStyle,
        backgroundColor: defaultBgcolor,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: zoomedSize,
          height: zoomedSize,
          backgroundColor: bgcolor,
          border: stroke ? `${stroke} solid 1px` : `${bgcolor} solid 1px`,
        }}
      />
      {image && (
        <Image
          src={image}
          width={zoomedImageSize}
          height={zoomedImageSize}
          style={{
            position: 'absolute',
            left: imageXY,
            top: imageXY,
            opacity: 0.8,
          }}
          alt={`tile-${x}-${y}`}
          draggable={false}
        />
      )}
      {unitsCount && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: zoomedSize,
            height: zoomedSize,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: zoomedFontSize,
            color: '#fff',
            textOverflow: 'ellipsis',
            overflow: 'visible',
            textShadow: '0 0 2px #000',
            userSelect: 'none',
          }}
        >
          {/* 50% */}
          {/* {tileHalf ? '50%' : unitsCount} */}

          {tileHalf ? '50%' : unitsCount}
        </div>
      )}

      {/* higlight when select*/}
      {isNextPossibleMove && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: zoomedSize,
            height: zoomedSize,
            backgroundColor: '#000',
            opacity: 0.5,
          }}
        />
      )}
    </div>
  );
}

export default React.memo(MapTile);
