import { useState, useEffect, useRef, useCallback } from 'react';
import { Position } from '@/lib/types';

const useMapDrag = (
  mapRef: any,
  position: Position,
  setPosition: any,
  zoom: number,
  setZoom: any
) => {
  const [dragging, setDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);

  const timeoutId = useRef<any>(undefined);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      setDragging(true);
      setStartPosition({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (dragging && mapRef.current) {
        setPosition({
          x: event.clientX - startPosition.x,
          y: event.clientY - startPosition.y,
        });
      }
    },
    [dragging, mapRef.current, startPosition]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 1) {
      setDragging(true);
      setStartPosition({
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      });
    } else if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
          Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      setInitialDistance(distance);
    }
  }, []);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      if (event.touches.length === 1) {
        const updatePosition = () => {
          setPosition({
            x: event.touches[0].clientX - startPosition.x,
            y: event.touches[0].clientY - startPosition.y,
          });
        };
        requestAnimationFrame(updatePosition);
      } else if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch1.clientX - touch2.clientX, 2) +
            Math.pow(touch1.clientY - touch2.clientY, 2)
        );
        const delta = distance - initialDistance;
        const newZoom = Math.min(Math.max(zoom + delta * 0.0002, 0.2), 4.0);
        setZoom(newZoom);
      }
    },
    [initialDistance, startPosition, zoom]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      if (timeoutId.current !== undefined) {
        window.clearTimeout(timeoutId.current);
      }
      timeoutId.current = window.setTimeout(() => {
        const newZoom = Math.min(
          Math.max(zoom + event.deltaY * -0.0008, 0.2),
          4.0
        );
        setZoom(newZoom);
        timeoutId.current = undefined;
      }, 50);
    },
    [zoom, timeoutId]
  );

  useEffect(() => {
    const mapNode = mapRef.current;
    if (mapNode) {
      mapNode.addEventListener('wheel', handleWheel, { passive: false });
      mapNode.addEventListener('mousedown', handleMouseDown);
      mapNode.addEventListener('mousemove', handleMouseMove);
      mapNode.addEventListener('mouseup', handleMouseUp);
      mapNode.addEventListener('touchstart', handleTouchStart);
      mapNode.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      });
      return () => {
        mapNode.removeEventListener('wheel', handleWheel);
        mapNode.removeEventListener('mousedown', handleMouseDown);
        mapNode.removeEventListener('mousemove', handleMouseMove);
        mapNode.removeEventListener('mouseup', handleMouseUp);
        mapNode.removeEventListener('touchstart', handleTouchStart);
        mapNode.removeEventListener('touchmove', handleTouchMove);
      };
    }
    return () => {};
  }, [
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
  ]);

  return { dragging };
};

export default useMapDrag;
