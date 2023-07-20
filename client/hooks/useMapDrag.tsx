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

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      setStartPosition({
        x: event.targetTouches[0].clientX - position.x,
        y: event.targetTouches[0].clientY - position.y,
      });
    },
    [position]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (mapRef.current) {
        setPosition({
          x: event.targetTouches[0].clientX - startPosition.x,
          y: event.targetTouches[0].clientY - startPosition.y,
        });
      }
    },
    [mapRef.current, startPosition]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      event.preventDefault();
      if (timeoutId.current !== undefined) {
        window.clearTimeout(timeoutId.current);
      }
      timeoutId.current = window.setTimeout(() => {
        const newZoom = zoom + event.deltaY * -0.0008;
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
      mapNode.addEventListener('touchmove', handleTouchMove);
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
