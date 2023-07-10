import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  TileType,
  TileProp,
  Position,
  Player,
  TileType2Image,
} from '@/lib/types';
import { ColorArr } from '@/lib/constants';

interface MapTileProps {
  zoom: number;
  imageZoom?: number;
  size: number;
  fontSize?: number;
  onChangeSize?: (size: number) => void;
  tile: TileProp;
  players: Player[];
  x: number;
  y: number;
  selectedMapPosition: Position;
  onChangeSelectedMapPosition: (position: Position) => void;
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
    players, // todo 没用上
    selectedMapPosition,
    onChangeSelectedMapPosition,
    possibleNextMapPositions,
  } = props;
  const [cursorStyle, setCursorStyle] = useState('default');

  const [tileType, color, unitCount] = tile;

  const image = TileType2Image[tileType];

  // todo 判断是否是当前玩家的地盘，由于game_update只返回了颜色信息，需要传入玩家颜色进行对比，但是这样的逻辑有点奇怪
  // 用来判断 canMove
  const isOwned = true;

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
    return x === selectedMapPosition.x && y === selectedMapPosition.y;
  }, [selectedMapPosition, x, y]);

  const isRevealed = useMemo(() => {
    return (
      unitCount !== null || // when reveal, swamp / city / plain's unitCount !== null
      tileType === TileType.Mountain // Mountain is always revealed
    );
  }, [unitCount]);

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
      onChangeSelectedMapPosition({ x, y });
    }
  }, [canMove, x, y, onChangeSelectedMapPosition]);

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
    if (color) {
      return ColorArr[color];
    }
    // 中立单位
    if (!color) {
      if (tileType === TileType.City) {
        return notOwnedCityFill;
      }
      if (unitCount) {
        return notOwnedArmyFill;
      }
    }

    // 空白单位
    return blankFill;
  }, [tileType, color, unitCount, isRevealed]);

  return (
    <div
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
      {unitCount && (
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
          {unitCount}
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
