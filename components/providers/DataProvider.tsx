"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { DataPoint, AggregationPeriod } from "@/lib/types";
import {
  aggregateData,
  filterByTimeRange,
  filterByCategory,
} from "@/lib/dataGenerator";

interface DataContextValue {
  data: DataPoint[];
  filteredData: DataPoint[];
  selectedCategories: string[];
  selectedPeriod: AggregationPeriod['type'];
  timeRange: { start: number; end: number } | null;
  setData: (data: DataPoint[]) => void;
  addDataPoint: (point: DataPoint) => void;
  toggleCategory: (category: string) => void;
  setPeriod: (period: AggregationPeriod['type']) => void;
  setTimeRange: (range: { start: number; end: number } | null) => void;
  reset: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  initialData: DataPoint[];
}

export function DataProvider({ children, initialData }: DataProviderProps) {
  const [data, setData] = useState<DataPoint[]>(initialData);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] =
    useState<AggregationPeriod["type"]>("1min");
  const [timeRange, setTimeRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const addDataPoint = useCallback((point: DataPoint) => {
    setData((prev) => {
      const updated = [...prev, point];
      if (updated.length > 50000) {
        return updated.slice(-50000);
      }
      return updated;
    });
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  const setPeriod = useCallback((period: AggregationPeriod["type"]) => {
    setSelectedPeriod(period);
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setSelectedCategories([]);
    setSelectedPeriod("1min");
    setTimeRange(null);
  }, [initialData]);

  const filteredData = useMemo(() => {
    let result = data;

    if (selectedCategories.length > 0) {
      result = filterByCategory(result, selectedCategories);
    }

    if (timeRange) {
      result = filterByTimeRange(result, timeRange.start, timeRange.end);
    }

    if (selectedPeriod !== "1min") {
      result = aggregateData(result, selectedPeriod);
    }

    return result;
  }, [data, selectedCategories, selectedPeriod, timeRange]);

  const value: DataContextValue = useMemo(
    () => ({
      data,
      filteredData,
      selectedCategories,
      selectedPeriod,
      timeRange,
      setData,
      addDataPoint,
      toggleCategory,
      setPeriod,
      setTimeRange,
      reset,
    }),
    [
      data,
      filteredData,
      selectedCategories,
      selectedPeriod,
      timeRange,
      addDataPoint,
      toggleCategory,
      setPeriod,
      reset,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

