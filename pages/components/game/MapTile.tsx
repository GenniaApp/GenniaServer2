import { useEffect, useMemo } from 'react';
import Image from 'next/image';

interface MapTileProps {
  zoom?: number;
  imageZoom?: number;
  size?: number;
  fill?: string; // fill color
  stroke?: string; // stroke color
  fontSize?: number;
  image?: string;
  text?: string | number;
  rowIndex: number;
  columnIndex: number;
  onChangeSize?: (size: number) => void;
  highlight?: boolean;
}

function MapTile(props: MapTileProps) {
  const {
    zoom = 1,
    imageZoom = 0.8,
    size = 50,
    fill = '#363636',
    stroke,
    fontSize = 20,
    image,
    text,
    rowIndex,
    columnIndex,
    onChangeSize: triggerChangeSize,
    highlight: isHighlight,
    ...restProps
  } = props;

  const zoomedSize = useMemo(() => size * zoom, [size, zoom]);

  const zoomedFontSize = useMemo(() => fontSize * zoom, [fontSize, zoom]);
  const tileX = useMemo(
    () => zoomedSize * columnIndex,
    [zoomedSize, columnIndex]
  );

  const tileY = useMemo(() => zoomedSize * rowIndex, [zoomedSize, rowIndex]);

  useEffect(() => {
    if (triggerChangeSize) {
      triggerChangeSize(zoomedSize);
    }
  }, [triggerChangeSize, zoomedSize]);

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
        ...restProps,
      }}
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

      {isHighlight && (
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
