"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DataPoint } from "@/lib/types";
import { generateNewDataPoint } from "@/lib/dataGenerator";

interface UseDataStreamOptions {
  interval?: number;
  maxPoints?: number;
  enabled?: boolean;
}

export function useDataStream(
  initialData: DataPoint[],
  options: UseDataStreamOptions = {}
) {
  const { interval = 100, maxPoints = 10000, enabled = true } = options;
  const [data, setData] = useState<DataPoint[]>(initialData);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimestampRef = useRef<number>(
    initialData.length > 0
      ? initialData[initialData.length - 1].timestamp
      : Date.now()
  );

  const addDataPoint = useCallback(
    (newPoint: DataPoint) => {
      setData((prev) => {
        const updated = [...prev, newPoint];
        if (updated.length > maxPoints) {
          return updated.slice(-maxPoints);
        }
        return updated;
      });
    },
    [maxPoints]
  );

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const newPoint = generateNewDataPoint(lastTimestampRef.current);
      lastTimestampRef.current = newPoint.timestamp;
      addDataPoint(newPoint);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, addDataPoint]);

  const reset = useCallback(() => {
    setData(initialData);
    lastTimestampRef.current =
      initialData.length > 0
        ? initialData[initialData.length - 1].timestamp
        : Date.now();
  }, [initialData]);

  return {
    data,
    addDataPoint,
    reset,
  };
}
