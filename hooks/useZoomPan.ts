"use client";

import { useState, useCallback, useRef } from "react";

interface ZoomPanState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function useZoomPan(initialScale = 1) {
  const [state, setState] = useState<ZoomPanState>({
    scale: initialScale,
    offsetX: 0,
    offsetY: 0,
  });

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleZoom = useCallback(
    (delta: number, centerX: number, centerY: number) => {
      setState((prev) => {
        const newScale = Math.max(0.1, Math.min(5, prev.scale + delta));
        const scaleChange = newScale / prev.scale;

        const newOffsetX = centerX - (centerX - prev.offsetX) * scaleChange;
        const newOffsetY = centerY - (centerY - prev.offsetY) * scaleChange;

        return {
          scale: newScale,
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        };
      });
    },
    []
  );

  const handlePanStart = useCallback((x: number, y: number) => {
    isDragging.current = true;
    lastMousePos.current = { x, y };
  }, []);

  const handlePanMove = useCallback((x: number, y: number) => {
    if (!isDragging.current) return;

    setState((prev) => ({
      ...prev,
      offsetX: prev.offsetX + (x - lastMousePos.current.x),
      offsetY: prev.offsetY + (y - lastMousePos.current.y),
    }));

    lastMousePos.current = { x, y };
  }, []);

  const handlePanEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const reset = useCallback(() => {
    setState({
      scale: initialScale,
      offsetX: 0,
      offsetY: 0,
    });
  }, [initialScale]);

  return {
    scale: state.scale,
    offsetX: state.offsetX,
    offsetY: state.offsetY,
    handleZoom,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    reset,
  };
}
