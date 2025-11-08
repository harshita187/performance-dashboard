"use client";

import { memo } from "react";
import { PerformanceMetrics } from "@/lib/types";

interface PerformanceMonitorProps {
  metrics: PerformanceMetrics;
}

function PerformanceMonitorComponent({ metrics }: PerformanceMonitorProps) {
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return "#10b981";
    if (fps >= 30) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="performance-monitor">
      <h3 className="performance-monitor-title">Performance Metrics</h3>
      <div className="performance-metrics">
        <div className="performance-metric">
          <span className="metric-label">FPS:</span>
          <span
            className="metric-value"
            style={{ color: getFPSColor(metrics.fps) }}
          >
            {metrics.fps}
          </span>
        </div>
        <div className="performance-metric">
          <span className="metric-label">Memory:</span>
          <span className="metric-value">
            {metrics.memoryUsage.toFixed(2)} MB
          </span>
        </div>
        <div className="performance-metric">
          <span className="metric-label">Render Time:</span>
          <span className="metric-value">
            {metrics.renderTime.toFixed(2)} ms
          </span>
        </div>
        <div className="performance-metric">
          <span className="metric-label">Data Processing:</span>
          <span className="metric-value">
            {metrics.dataProcessingTime.toFixed(2)} ms
          </span>
        </div>
      </div>
    </div>
  );
}

export const PerformanceMonitor = memo(PerformanceMonitorComponent);
