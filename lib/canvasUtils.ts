import { ChartDimensions, RenderData } from "./types";

export function calculateChartDimensions(
  containerWidth: number,
  containerHeight: number,
  padding = { top: 20, right: 20, bottom: 40, left: 60 }
): ChartDimensions {
  return {
    width: containerWidth,
    height: containerHeight,
    padding,
  };
}

export function scaleValue(
  value: number,
  min: number,
  max: number,
  canvasMin: number,
  canvasMax: number
): number {
  if (max === min) return canvasMin;
  const ratio = (value - min) / (max - min);
  return canvasMin + ratio * (canvasMax - canvasMin);
}

export function prepareRenderData(
  data: Array<{ timestamp: number; value: number }>,
  dimensions: ChartDimensions
): RenderData {
  if (data.length === 0) {
    return {
      points: [],
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }

  const timestamps = data.map((d) => d.timestamp);
  const values = data.map((d) => d.value);

  const minX = Math.min(...timestamps);
  const maxX = Math.max(...timestamps);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);

  const yRange = maxY - minY;
  const yPadding = yRange * 0.1;
  const adjustedMinY = minY - yPadding;
  const adjustedMaxY = maxY + yPadding;

  const chartWidth =
    dimensions.width - dimensions.padding.left - dimensions.padding.right;
  const chartHeight =
    dimensions.height - dimensions.padding.top - dimensions.padding.bottom;

  const points = data.map((d) => ({
    x: scaleValue(
      d.timestamp,
      minX,
      maxX,
      dimensions.padding.left,
      dimensions.width - dimensions.padding.right
    ),
    y: scaleValue(
      d.value,
      adjustedMinY,
      adjustedMaxY,
      dimensions.padding.top,
      dimensions.height - dimensions.padding.bottom
    ),
    value: d.value,
    timestamp: d.timestamp,
  }));

  return {
    points,
    minX,
    maxX,
    minY: adjustedMinY,
    maxY: adjustedMaxY,
  };
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  dimensions: ChartDimensions,
  xTicks: number = 10,
  yTicks: number = 10
): void {
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;

  const chartWidth =
    dimensions.width - dimensions.padding.left - dimensions.padding.right;
  const chartHeight =
    dimensions.height - dimensions.padding.top - dimensions.padding.bottom;

  for (let i = 0; i <= xTicks; i++) {
    const x = dimensions.padding.left + (chartWidth / xTicks) * i;
    ctx.beginPath();
    ctx.moveTo(x, dimensions.padding.top);
    ctx.lineTo(x, dimensions.height - dimensions.padding.bottom);
    ctx.stroke();
  }

  for (let i = 0; i <= yTicks; i++) {
    const y = dimensions.padding.top + (chartHeight / yTicks) * i;
    ctx.beginPath();
    ctx.moveTo(dimensions.padding.left, y);
    ctx.lineTo(dimensions.width - dimensions.padding.right, y);
    ctx.stroke();
  }
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatValue(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}
