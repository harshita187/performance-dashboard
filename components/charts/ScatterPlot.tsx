"use client";

import { memo, useRef, useEffect, useCallback, useMemo } from "react";
import { DataPoint } from "@/lib/types";
import {
  calculateChartDimensions,
  prepareRenderData,
  clearCanvas,
  drawGrid,
} from "@/lib/canvasUtils";

interface ScatterPlotProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  pointSize?: number;
  showGrid?: boolean;
}

function ScatterPlotComponent({
  data,
  width,
  height,
  color = "#f59e0b",
  pointSize = 4,
  showGrid = true,
}: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = calculateChartDimensions(
      canvas.width / window.devicePixelRatio,
      canvas.height / window.devicePixelRatio
    );

    clearCanvas(ctx, canvas.width, canvas.height);

    if (data.length === 0) return;

    const renderData = prepareRenderData(data, dimensions);

    if (showGrid) {
      drawGrid(ctx, dimensions);
    }

    ctx.fillStyle = color;
    for (const point of renderData.points) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [data, showGrid, color, pointSize]);

  useEffect(() => {
    const animate = () => {
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        render();
      }
    });

    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, [render]);

  const canvasStyle = useMemo(
    () => ({
      width: width || "100%",
      height: height || "100%",
      display: "block",
    }),
    [width, height]
  );

  return (
    <canvas
      ref={canvasRef}
      style={canvasStyle}
      width={width}
      height={height}
    />
  );
}

export const ScatterPlot = memo(ScatterPlotComponent);

