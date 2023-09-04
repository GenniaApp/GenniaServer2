import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';
import useMapDrag from './useMapDrag';

interface Position {
  x: number;
  y: number;
}

interface useMapProps {
  mapWidth: number;
  mapHeight: number;
  listenTouch?: boolean;
}

export default function useMap({
  mapWidth,
  mapHeight,
  listenTouch = true,
}: useMapProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [tileSize, setTileSize] = useState(40);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useMapDrag(mapRef, position, setPosition, zoom, setZoom, listenTouch);

  const isSmallScreen = useMediaQuery('(max-width:600px)');
  useEffect(() => {
    setZoom(isSmallScreen ? 0.7 : 1.0);

    if (mapHeight > 40 || mapHeight > 40) {
      setZoom(0.5);
    } else if (mapHeight > 25 || mapHeight > 25) {
      setZoom(0.75);
    }
  }, [isSmallScreen]);

  const mapPixelWidth = useMemo(
    () => tileSize * mapWidth * zoom,
    [tileSize, mapWidth, zoom]
  );
  const mapPixelHeight = useMemo(
    () => tileSize * mapHeight * zoom,
    [tileSize, mapHeight, zoom]
  );

  function handleZoomOption(option: string) {
    switch (option) {
      case '1':
        if (mapWidth > 20 || mapHeight > 20) {
          setZoom(0.5);
        } else {
          setZoom(0.7);
        }
        break;
      case '2':
        setZoom(1.0);
        break;
      case '3':
        setZoom(1.3);
        break;
      default:
        // handle default case
        break;
    }
  }

  return {
    tileSize,
    position,
    mapRef,
    mapPixelWidth,
    mapPixelHeight,
    zoom,
    setZoom,
    handleZoomOption,
    setPosition,
    setTileSize,
  };
}
