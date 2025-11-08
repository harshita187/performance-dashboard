"use client";

import { useState, useEffect, useRef } from "react";
import { PerformanceMetrics } from "@/lib/types";
import { createFPSMonitor, getMemoryUsage } from "@/lib/performanceUtils";

export function usePerformanceMonitor(enabled: boolean = true) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    renderTime: 0,
    dataProcessingTime: 0,
  });

  const fpsMonitorRef = useRef(createFPSMonitor());
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      fpsMonitorRef.current.stop();
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      return;
    }

    fpsMonitorRef.current.start();

    updateIntervalRef.current = setInterval(() => {
      const fps = fpsMonitorRef.current.getFPS();
      const memoryUsage = getMemoryUsage() || 0;

      setMetrics((prev) => ({
        ...prev,
        fps,
        memoryUsage,
      }));
    }, 1000);

    return () => {
      fpsMonitorRef.current.stop();
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [enabled]);

  const recordRenderTime = (time: number) => {
    setMetrics((prev) => ({
      ...prev,
      renderTime: time,
    }));
  };

  const recordDataProcessingTime = (time: number) => {
    setMetrics((prev) => ({
      ...prev,
      dataProcessingTime: time,
    }));
  };

  return {
    metrics,
    recordRenderTime,
    recordDataProcessingTime,
  };
}
