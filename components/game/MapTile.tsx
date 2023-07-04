import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { PlayerProp, TileProp, MapPosition } from './types-new';
import useMapTileState from '@/hooks/use-map-tile-state';

interface MapTileProps {
  zoom?: number;
  imageZoom?: number;
  size?: number;
  fontSize?: number;
  onChangeSize?: (size: number) => void;
  tile: TileProp;
  players: PlayerProp[];
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

// function MapTile(props: MapTileProps) {
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

  const { image, text, fill, stroke, canMove, onClick, highlight } =
    useMapTileState({
      players,
      tile,
      rowIndex,
      columnIndex,
      selectedMapPosition,
      onChangeSelectedMapPosition,
      possibleNextMapPositions,
    });

  const handleMouseEnter = useCallback(
    (event) => {
      if (canMove) {
        setCursorStyle('pointer');
      }
    },
    [canMove]
  );

  const handleMouseLeave = useCallback(
    (event) => {
      if (canMove) {
        setCursorStyle('default');
      }
    },
    [canMove]
  );

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
      onClick={onClick}
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

      {highlight && (
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
