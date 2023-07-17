import { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  TileType,
  CustomMapTileData,
  Position,
  TileType2Image,
} from '@/lib/types';
import { ColorArr } from '@/lib/constants';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

interface MapTileProps {
  zoom: number;
  size: number;
  tile: CustomMapTileData;
  x: number;
  y: number;
  handleClick: any;
  imageZoom?: number;
  fontSize?: number;
}

const notOwnedArmyFill = '#D7D7D7';
const notOwnedCityFill = '#757575';
const MountainFill = '#bbbbbb';
const blankFill = '#dcdcdc';

export default function CustomMapTile(props: MapTileProps) {
  const {
    zoom,
    size,
    x,
    y,
    tile,
    imageZoom = 0.8,
    fontSize = 16,
    handleClick,
  } = props;

  const [tileType, color, unitsCount, isRevealed, priority] = tile;
  const image = TileType2Image[tileType];

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
  }, [tileType, color, unitsCount]);

  return (
    <div
      style={{
        position: 'absolute',
        left: tileX,
        top: tileY,
        width: zoomedSize,
        height: zoomedSize,
      }}
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
          border: '#000 solid 1px',
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
          }}
        >
          {unitsCount}
        </div>
      )}

      {isRevealed && (
        <LightbulbOutlinedIcon
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: zoomedSize * 0.5,
            height: zoomedSize * 0.5,
          }}
        />
      )}
    </div>
  );
}
