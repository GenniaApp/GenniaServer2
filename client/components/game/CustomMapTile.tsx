import React, { useMemo } from 'react';
import Image from 'next/image';
import {
  TileType,
  DisplayCustomMapTileData,
  TileType2Image,
} from '@/lib/types';
import { ColorArr } from '@/lib/constants';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import {
  defaultBgcolor,
  notRevealedFill,
  notOwnedArmyFill,
  notOwnedCityFill,
  MountainFill,
  blankFill,
} from '@/lib/constants';

interface CustomMapTileProps {
  zoom: number;
  size: number;
  tile: DisplayCustomMapTileData;
  x: number;
  y: number;
  handleClick: any;
  imageZoom?: number;
  fontSize?: number;
}

function CustomMapTile(props: CustomMapTileProps) {
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

  const [tileType, color, unitsCount, isAlwaysRevealed, priority] = tile;
  const image = TileType2Image[tileType];

  const zoomedSize = useMemo(() => size * zoom, [size, zoom]);
  const bgPosition = useMemo(() => zoomedSize * 0.025, [zoomedSize]); // shift to create a "border"
  const bgWidth = useMemo(() => zoomedSize * 0.95, [zoomedSize]);
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
    //
    if (tileType === TileType.Fog || tileType === TileType.Obstacle) {
      return notRevealedFill;
    }

    // 山
    if (tileType === TileType.Mountain) {
      return MountainFill;
    }

    if (tileType === TileType.Swamp) {
      return notOwnedArmyFill;
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
        backgroundColor: defaultBgcolor,
      }}
      onClick={handleClick}
    >
      <div
        style={{
          position: 'absolute',
          left: bgPosition,
          top: bgPosition,
          width: bgWidth,
          height: bgWidth,
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
            userSelect: 'none',
          }}
        >
          {unitsCount}
        </div>
      )}

      {isAlwaysRevealed && (
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

export default React.memo(CustomMapTile);
