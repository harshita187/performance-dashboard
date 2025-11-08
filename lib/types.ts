export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  type: "line" | "bar" | "scatter" | "heatmap";
  dataKey: string;
  color: string;
  visible: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  dataProcessingTime: number;
}

export interface TimeRange {
  start: number;
  end: number;
}

export interface AggregationPeriod {
  type: "1min" | "5min" | "1hour";
  label: string;
}

export interface ChartDimensions {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface RenderData {
  points: Array<{ x: number; y: number; value: number; timestamp: number }>;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
