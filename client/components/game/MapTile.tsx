import { useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { TileType, TileProp, Position, TileType2Image } from '@/lib/types';
import { ColorArr } from '@/lib/constants';
import { useGame, useGameDispatch } from '@/context/GameContext';
import { Room } from '@/lib/types';

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

const notRevealedFill = '#363636';
const notOwnedArmyFill = '#D7D7D7';
const notOwnedCityFill = '#757575';
const MountainFill = '#bbbbbb';
const blankFill = '#dcdcdc';
const selectedStroke = '#fff';
const revealedStroke = '#000';

export default function MapTile(props: MapTileProps) {
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
  const { room, myPlayerId, selectedMapTileInfo, mapQueueData } = useGame();
  const { setSelectedMapTileInfo } = useGameDispatch();

  const [tileType, color, unitsCount] = tile;
  const image = TileType2Image[tileType];

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
  }, [room, myPlayerId]);

  const isOwned = useMemo(() => {
    return color === room.players[myPlayerIndex].color;
  }, [myPlayerIndex, color]);

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

  const isSelected = useMemo(() => {
    return x === selectedMapTileInfo.x && y === selectedMapTileInfo.y;
  }, [selectedMapTileInfo, x, y]);

  const isRevealed = useMemo(() => {
    return (
      unitsCount !== null || // when reveal, swamp / city / plain's unitsCount !== null
      tileType === TileType.Mountain // Mountain is always revealed
    );
  }, [unitsCount]);

  const stroke = useMemo(() => {
    if (isSelected) {
      return selectedStroke;
    }

    if (isRevealed) {
      return revealedStroke;
    }
  }, [isSelected, isRevealed, tileType]);

  const canMove = useMemo(() => {
    return isOwned || isNextPossibleMove;
  }, [isOwned, isNextPossibleMove]);

  const handleClick = useCallback(() => {
    if (canMove) {
      setSelectedMapTileInfo({ x, y, half: false, unitsCount: unitsCount });
    }
  }, [canMove, x, y, setSelectedMapTileInfo, unitsCount]);

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
    }

    // 空白单位
    return blankFill;
  }, [tileType, color, unitsCount, isRevealed]);

  return (
    <div
      className={mapQueueData ? mapQueueData[x][y].className : ''}
      style={{
        position: 'absolute',
        left: tileX,
        top: tileY,
        width: zoomedSize,
        height: zoomedSize,
        cursor: cursorStyle,
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
          border: stroke ? `${stroke} solid 1px` : '',
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
            overflow: 'hidden',
            textShadow: '0 0 2px #000',
          }}
        >
          {/* 50% */}
          {mapQueueData
            ? mapQueueData[x][y].text
              ? mapQueueData[x][y].text
              : unitsCount
            : unitsCount}
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
