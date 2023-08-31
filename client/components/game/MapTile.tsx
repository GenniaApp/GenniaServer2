import React, { useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { TileType, TileProp, TileType2Image } from '@/lib/types';
import {
  ColorArr,
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
  tile: TileProp;
  x: number;
  y: number;
  isOwned: boolean;
  _className: string;
  tileHalf: boolean;
  isSelected: boolean;
  selectRef: any;
  attackQueueRef: any;
  setSelectedMapTileInfo: any;
  mapQueueDataDispatch: any;
  isNextPossibleMove: boolean;
  whichNextPossibleMove: any;
}

export default React.memo(function MapTile(props: MapTileProps) {
  const {
    zoom,
    imageZoom = 0.8,
    size,
    fontSize = 16,
    x,
    y,
    tile,
    isOwned,
    _className,
    tileHalf,
    isSelected,
    selectRef,
    attackQueueRef,
    setSelectedMapTileInfo,
    mapQueueDataDispatch,
    isNextPossibleMove,
    whichNextPossibleMove,
  } = props;
  const [cursorStyle, setCursorStyle] = useState('default');

  const [tileType, color, unitsCount] = tile;
  const image = TileType2Image[tileType];

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
        from: selectRef.current,
        to: { x, y },
        half: selectRef.current.half,
      });
      setSelectedMapTileInfo({
        // ...selectRef.current,
        x,
        y,
        half: false,
        unitsCount: 0,
      });
      mapQueueDataDispatch({
        type: 'change',
        x: selectRef.current.x,
        y: selectRef.current.y,
        className: className,
      });
    },
    [
      selectRef.current,
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
      if (selectRef.current.x === x && selectRef.current.y === y) {
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
  }, [
    x,
    y,
    selectRef.current,
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
      className={_className}
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

      {/* highlight when select*/}
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
});
