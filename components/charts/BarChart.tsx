"use client";

import { memo, useRef, useEffect, useCallback, useMemo } from "react";
import { DataPoint } from "@/lib/types";
import {
  calculateChartDimensions,
  prepareRenderData,
  clearCanvas,
  drawGrid,
} from "@/lib/canvasUtils";

interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
}

function BarChartComponent({
  data,
  width,
  height,
  color = "#10b981",
  showGrid = true,
}: BarChartProps) {
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

    if (renderData.points.length > 0) {
      const barWidth =
        (dimensions.width -
          dimensions.padding.left -
          dimensions.padding.right) /
        renderData.points.length;

      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      for (const point of renderData.points) {
        const barHeight =
          dimensions.height - dimensions.padding.bottom - point.y;
        ctx.fillRect(
          point.x - barWidth / 2,
          point.y,
          barWidth * 0.8,
          barHeight
        );
      }
    }
  }, [data, showGrid, color]);

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

export const BarChart = memo(BarChartComponent);

