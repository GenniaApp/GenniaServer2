import { useState, useEffect, useRef, useCallback } from 'react';
import { Position } from '@/lib/types';

const useMapDrag = (
  mapRef: any,
  position: Position,
  setPosition: any,
  zoom: number,
  setZoom: any
) => {
  const [mouseDragging, setMouseDragging] = useState(false);
  const [touchDragging, setTouchDragging] = useState(false);
  const [mouseStartPosition, setMouseStartPosition] = useState({ x: 0, y: 0 });
  const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState(0);

  const timeoutId = useRef<any>(undefined);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      setMouseDragging(true);
      setMouseStartPosition({
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      });
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (mouseDragging) {
        setPosition({
          x: event.clientX - mouseStartPosition.x,
          y: event.clientY - mouseStartPosition.y,
        });
      }
    },
    [mouseDragging, mouseStartPosition]
  );

  const handleMouseUp = useCallback(() => {
    setMouseDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length === 1) {
        setTouchDragging(true);
        setTouchStartPosition({
          x: event.touches[0].clientX - position.x,
          y: event.touches[0].clientY - position.y,
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
    },
    [position]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      if (!touchDragging) return;
      if (event.touches.length === 1) {
        const updatePosition = () => {
          setPosition({
            x: event.touches[0].clientX - touchStartPosition.x,
            y: event.touches[0].clientY - touchStartPosition.y,
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
    [initialDistance, touchStartPosition, zoom]
  );

  const handleTouchEnd = useCallback(() => {
    setTouchDragging(false);
  }, []);

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
      mapNode.addEventListener('touchend', handleTouchEnd);

      return () => {
        mapNode.removeEventListener('wheel', handleWheel);
        mapNode.removeEventListener('mousedown', handleMouseDown);
        mapNode.removeEventListener('mousemove', handleMouseMove);
        mapNode.removeEventListener('mouseup', handleMouseUp);
        mapNode.removeEventListener('touchstart', handleTouchStart);
        mapNode.removeEventListener('touchmove', handleTouchMove);
        mapNode.removeEventListener('touchend', handleTouchEnd);
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

  return { mouseDragging };
};

export default useMapDrag;
