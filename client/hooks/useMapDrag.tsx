import { useEffect, useRef, useCallback } from 'react';
import { Position } from '@/lib/types';

const useMapDrag = (
  mapRef: any,
  position: Position,
  setPosition: any,
  zoom: number,
  setZoom: any,
  listenTouch: boolean
) => {
  const mouseDragging = useRef(false);
  const touchDragging = useRef(false);
  const mouseStartPosition = useRef({ x: 0, y: 0 });
  const touchStartPosition = useRef({ x: 0, y: 0 });
  const initialDistance = useRef(0);

  const timeoutId = useRef<any>(undefined);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      mouseDragging.current = true;
      mouseStartPosition.current = {
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      };
    },
    [position]
  );

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (mouseDragging.current) {
      setPosition({
        x: event.clientX - mouseStartPosition.current.x,
        y: event.clientY - mouseStartPosition.current.y,
      });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    mouseDragging.current = false;
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (event.touches.length === 1) {
        touchDragging.current = true;
        touchStartPosition.current = {
          x: event.touches[0].clientX - position.x,
          y: event.touches[0].clientY - position.y,
        };
      } else if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.sqrt(
          Math.pow(touch1.clientX - touch2.clientX, 2) +
            Math.pow(touch1.clientY - touch2.clientY, 2)
        );
        initialDistance.current = distance;
      }
    },
    [position]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();
      if (!touchDragging.current) return;
      if (event.touches.length === 1) {
        const updatePosition = () => {
          setPosition({
            x: event.touches[0].clientX - touchStartPosition.current.x,
            y: event.touches[0].clientY - touchStartPosition.current.y,
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
        const delta = distance - initialDistance.current;
        const newZoom = Math.min(Math.max(zoom + delta * 0.0002, 0.2), 4.0);
        setZoom(newZoom);
      }
    },
    [touchDragging.current, zoom]
  );

  const handleTouchEnd = useCallback(() => {
    touchDragging.current = false;
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
      if (listenTouch) {
        mapNode.addEventListener('touchstart', handleTouchStart);
        mapNode.addEventListener('touchmove', handleTouchMove, {
          passive: false,
        });
        mapNode.addEventListener('touchend', handleTouchEnd);
      }

      return () => {
        mapNode.removeEventListener('wheel', handleWheel);
        mapNode.removeEventListener('mousedown', handleMouseDown);
        mapNode.removeEventListener('mousemove', handleMouseMove);
        mapNode.removeEventListener('mouseup', handleMouseUp);
        if (listenTouch) {
          mapNode.removeEventListener('touchstart', handleTouchStart);
          mapNode.removeEventListener('touchmove', handleTouchMove);
          mapNode.removeEventListener('touchend', handleTouchEnd);
        }
      };
    }
    return () => {};
  }, [
    mapRef.current,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
  ]);
};

export default useMapDrag;
