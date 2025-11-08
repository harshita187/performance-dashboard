"use client";

import { memo, useMemo, useRef, useEffect } from "react";
import { DataPoint } from "@/lib/types";
import { useChartRenderer } from "@/hooks/useChartRenderer";
import { useZoomPan } from "@/hooks/useZoomPan";

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
}

function LineChartComponent({
  data,
  width,
  height,
  color = "#3b82f6",
  showGrid = true,
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    scale,
    offsetX,
    offsetY,
    handleZoom,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    reset,
  } = useZoomPan(1);

  const { canvasRef } = useChartRenderer(data, {
    showGrid,
    lineColor: color,
    lineWidth: 2,
    scale,
    offsetX,
    offsetY,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      handleZoom(-e.deltaY * 0.001, centerX, centerY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        handlePanStart(e.clientX, e.clientY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      handlePanMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handlePanEnd();
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleZoom, handlePanStart, handlePanMove, handlePanEnd]);

  const canvasStyle = useMemo(
    () => ({
      width: width || "100%",
      height: height || "100%",
      display: "block",
      cursor: "grab",
    }),
    [width, height]
  );

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        width={width}
        height={height}
      />
      <button
        onClick={reset}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "6px 12px",
          fontSize: "12px",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Reset
      </button>
    </div>
  );
}

export const LineChart = memo(LineChartComponent);
