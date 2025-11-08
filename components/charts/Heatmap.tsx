"use client";

import { memo, useRef, useEffect, useCallback, useMemo } from "react";
import { DataPoint } from "@/lib/types";
import {
  calculateChartDimensions,
  clearCanvas,
  drawGrid,
  scaleValue,
} from "@/lib/canvasUtils";

interface HeatmapProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  showGrid?: boolean;
}

function HeatmapComponent({
  data,
  width,
  height,
  showGrid = true,
}: HeatmapProps) {
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

    if (showGrid) {
      drawGrid(ctx, dimensions);
    }

    const timeBuckets = 20;
    const valueBuckets = 20;
    const bucketSize = Math.ceil(data.length / timeBuckets);

    const values = data.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const chartWidth =
      dimensions.width - dimensions.padding.left - dimensions.padding.right;
    const chartHeight =
      dimensions.height - dimensions.padding.top - dimensions.padding.bottom;

    const cellWidth = chartWidth / timeBuckets;
    const cellHeight = chartHeight / valueBuckets;

    for (let i = 0; i < timeBuckets; i++) {
      const startIdx = i * bucketSize;
      const endIdx = Math.min(startIdx + bucketSize, data.length);
      const bucketData = data.slice(startIdx, endIdx);

      if (bucketData.length === 0) continue;

      const avgValue =
        bucketData.reduce((sum, d) => sum + d.value, 0) / bucketData.length;

      const intensity = scaleValue(avgValue, minValue, maxValue, 0, 1);
      const hue = (1 - intensity) * 240;
      const saturation = 70;
      const lightness = 50;

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      const x = dimensions.padding.left + i * cellWidth;
      const valueBucket = Math.floor(
        scaleValue(avgValue, minValue, maxValue, 0, valueBuckets)
      );
      const y =
        dimensions.padding.top +
        (valueBuckets - valueBucket - 1) * cellHeight;

      ctx.fillRect(x, y, cellWidth, cellHeight);
    }
  }, [data, showGrid]);

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

export const Heatmap = memo(HeatmapComponent);

