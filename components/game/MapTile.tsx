import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { PlayersProp, TileProp, MapPosition } from './types-new';
import { useTileState } from '@/hooks/index';
import { ColorArr } from '@/lib/constants';

interface MapTileProps {
  zoom: number;
  imageZoom: number;
  size: number;
  fontSize?: number;
  onChangeSize?: (size: number) => void;
  tile: TileProp;
  players: PlayersProp;
  rowIndex: number;
  columnIndex: number;
  selectedMapPosition: MapPosition;
  onChangeSelectedMapPosition: (mapPosition: MapPosition) => void;
  possibleNextMapPositions: {
    top: MapPosition;
    right: MapPosition;
    bottom: MapPosition;
    left: MapPosition;
  };
  restProps: any;
}

const notRevealedFill = '#363636';
const notOwnedArmyFill = '#D7D7D7';
const notOwnedSpawnerFill = '#757575';
const blankFill = '#B3B3B3';
const selectedStroke = '#fff';
const revealedStroke = '#000';

function MapTile(props: MapTileProps) {
  const {
    zoom,
    imageZoom = 0.8,
    size,
    fontSize = 20,
    rowIndex,
    columnIndex,
    tile,
    players,
    selectedMapPosition,
    onChangeSelectedMapPosition,
    possibleNextMapPositions,
    ...restProps
  } = props;
  const [cursorStyle, setCursorStyle] = useState('default');

  const {
    isOwned,
    playerId,
    typeImageUrl: image,
    unitiesCount: text,
    isRevealed,
    isSpawnerType,
    isBlankType,
    isArmyType,
  } = useTileState(tile);

  const isNextPossibleMove = useMemo(() => {
    const isNextPossibleMapPosition = Object.values(
      possibleNextMapPositions
    ).some((maybeNextMapPosition) => {
      return (
        maybeNextMapPosition &&
        maybeNextMapPosition.rowIndex === rowIndex &&
        maybeNextMapPosition.columnIndex === columnIndex
      );
    });

    return isNextPossibleMapPosition && !isBlankType;
  }, [possibleNextMapPositions, rowIndex, columnIndex, isBlankType]);

  const player = useMemo(() => {
    if (isOwned) {
      return players[playerId];
    }
  }, [isOwned, players, playerId]);

  // todo: refactor player type
  const playerColor = player ? player[2] : undefined;

  const fill = useMemo(() => {
    if (isOwned) {
      return ColorArr[playerColor];
    }

    if (!isRevealed) {
      return notRevealedFill;
    }

    if (isArmyType) {
      return notOwnedArmyFill;
    }

    if (isSpawnerType) {
      return notOwnedSpawnerFill;
    }

    if (isBlankType) {
      return blankFill;
    }
  }, [
    isOwned,
    playerColor,
    isRevealed,
    notRevealedFill,
    isArmyType,
    notOwnedArmyFill,
    isSpawnerType,
    notOwnedSpawnerFill,
    isBlankType,
    blankFill,
  ]);

  const isSelected = useMemo(() => {
    return (
      rowIndex === selectedMapPosition.rowIndex &&
      columnIndex === selectedMapPosition.columnIndex
    );
  }, [selectedMapPosition, rowIndex, columnIndex]);

  const stroke = useMemo(() => {
    if (isSelected) {
      return selectedStroke;
    }

    if (isRevealed) {
      return revealedStroke;
    }
  }, [isSelected, selectedStroke, isRevealed, revealedStroke]);

  const canMove = useMemo(() => {
    return isOwned || isNextPossibleMove;
  }, [isOwned, isNextPossibleMove]);

  const handleClick = useCallback(() => {
    if (canMove) {
      onChangeSelectedMapPosition({ rowIndex, columnIndex });
    }
  }, [canMove, rowIndex, columnIndex, onChangeSelectedMapPosition]);

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
  const tileX = useMemo(
    () => zoomedSize * columnIndex,
    [zoomedSize, columnIndex]
  );

  const tileY = useMemo(() => zoomedSize * rowIndex, [zoomedSize, rowIndex]);

  const zoomedImageSize = useMemo(
    () => zoomedSize * imageZoom,
    [zoomedSize, imageZoom]
  );

  const imageXY = useMemo(
    () => (zoomedSize - zoomedImageSize) / 2,
    [zoomedSize, zoomedImageSize]
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: tileX,
        top: tileY,
        width: zoomedSize,
        height: zoomedSize,
        cursor: cursorStyle,
        ...restProps,
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
          backgroundColor: fill,
          border: `${stroke} solid 1px`,
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
          alt={`tile-${rowIndex}-${columnIndex}`}
        />
      )}
      {text && (
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
          {text}
        </div>
      )}

      {/* higlight */}
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

export default MapTile;
