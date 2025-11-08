"use client";

import { useRef, useEffect, useCallback } from "react";
import { DataPoint, ChartDimensions } from "@/lib/types";
import {
  calculateChartDimensions,
  prepareRenderData,
  clearCanvas,
  drawGrid,
} from "@/lib/canvasUtils";

interface UseChartRendererOptions {
  dimensions?: ChartDimensions;
  showGrid?: boolean;
  lineColor?: string;
  lineWidth?: number;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
}

export function useChartRenderer(
  data: DataPoint[],
  options: UseChartRendererOptions = {}
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const {
    dimensions,
    showGrid = true,
    lineColor = "#3b82f6",
    lineWidth = 2,
    scale = 1,
    offsetX = 0,
    offsetY = 0,
  } = options;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chartDimensions =
      dimensions || calculateChartDimensions(canvas.width, canvas.height);

    clearCanvas(ctx, canvas.width, canvas.height);

    if (data.length === 0) return;

    const renderData = prepareRenderData(data, chartDimensions);

    if (showGrid) {
      drawGrid(ctx, chartDimensions);
    }

    if (renderData.points.length > 0) {
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      ctx.translate(-offsetX, -offsetY);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      const firstPoint = renderData.points[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let i = 1; i < renderData.points.length; i++) {
        const point = renderData.points[i];
        ctx.lineTo(point.x, point.y);
      }

      ctx.stroke();
      ctx.restore();
    }
  }, [
    data,
    dimensions,
    showGrid,
    lineColor,
    lineWidth,
    scale,
    offsetX,
    offsetY,
  ]);

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

  return {
    canvasRef,
    render,
  };
}
