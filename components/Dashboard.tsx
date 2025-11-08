"use client";

import { useState, useMemo, useTransition } from "react";
import { useData } from "./providers/DataProvider";
import { useDataStream } from "@/hooks/useDataStream";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { LineChart } from "./charts/LineChart";
import { BarChart } from "./charts/BarChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { Heatmap } from "./charts/Heatmap";
import { FilterPanel } from "./controls/FilterPanel";
import { TimeRangeSelector } from "./controls/TimeRangeSelector";
import { DataTable } from "./ui/DataTable";
import { PerformanceMonitor } from "./ui/PerformanceMonitor";
import { AggregationPeriod } from "@/lib/types";

const AGGREGATION_PERIODS: AggregationPeriod[] = [
  { type: "1min", label: "1 Minute" },
  { type: "5min", label: "5 Minutes" },
  { type: "1hour", label: "1 Hour" },
];

export default function Dashboard() {
  const {
    data,
    filteredData,
    selectedCategories,
    selectedPeriod,
    toggleCategory,
    setPeriod,
  } = useData();

  const [streamEnabled, setStreamEnabled] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dataLoad, setDataLoad] = useState(1000);
  const [stressTest, setStressTest] = useState(false);

  const categories = useMemo(() => {
    const unique = new Set(data.map((d) => d.category));
    return Array.from(unique);
  }, [data]);

  const { addDataPoint } = useDataStream(data, {
    interval: stressTest ? 50 : 100,
    maxPoints: stressTest ? 50000 : 10000,
    enabled: streamEnabled,
  });

  const { metrics } = usePerformanceMonitor(true);

  const temperatureData = useMemo(
    () => filteredData.filter((d) => d.category === "temperature"),
    [filteredData]
  );
  const pressureData = useMemo(
    () => filteredData.filter((d) => d.category === "pressure"),
    [filteredData]
  );
  const humidityData = useMemo(
    () => filteredData.filter((d) => d.category === "humidity"),
    [filteredData]
  );
  const voltageData = useMemo(
    () => filteredData.filter((d) => d.category === "voltage"),
    [filteredData]
  );

  const handleStreamToggle = () => {
    startTransition(() => {
      setStreamEnabled((prev) => !prev);
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Performance Dashboard</h1>
        <p>Real-time data visualization with 10,000+ data points</p>
      </div>

      <div className="dashboard-controls">
        <div className="control-panel">
          <FilterPanel
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={toggleCategory}
          />
        </div>
        <div className="control-panel">
          <TimeRangeSelector
            periods={AGGREGATION_PERIODS}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setPeriod}
          />
        </div>
        <div className="control-panel">
          <PerformanceMonitor metrics={metrics} />
        </div>
      </div>

      <div className="dashboard-controls">
        <button
          className="btn btn-primary"
          onClick={handleStreamToggle}
          disabled={isPending}
        >
          {streamEnabled ? "Stop Stream" : "Start Stream"}
        </button>
        <div className="control-panel">
          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>
            Data Load: {dataLoad}
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={dataLoad}
              onChange={(e) => setDataLoad(Number(e.target.value))}
              style={{ width: "100%", marginTop: "4px" }}
            />
          </label>
        </div>
        <div className="control-panel">
          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}>
            <input
              type="checkbox"
              checked={stressTest}
              onChange={(e) => setStressTest(e.target.checked)}
            />
            Stress Test Mode
          </label>
        </div>
        <div className="control-panel">
          <p style={{ fontSize: "0.9rem", color: "#666" }}>
            Data Points: {filteredData.length.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-chart">
          <h2>Temperature - Line Chart</h2>
          <div className="chart-container">
            <LineChart data={temperatureData} color="#ef4444" />
          </div>
        </div>

        <div className="dashboard-chart">
          <h2>Pressure - Bar Chart</h2>
          <div className="chart-container">
            <BarChart data={pressureData} color="#3b82f6" />
          </div>
        </div>

        <div className="dashboard-chart">
          <h2>Humidity - Scatter Plot</h2>
          <div className="chart-container">
            <ScatterPlot data={humidityData} color="#10b981" />
          </div>
        </div>

        <div className="dashboard-chart">
          <h2>Voltage - Heatmap</h2>
          <div className="chart-container">
            <Heatmap data={voltageData} />
          </div>
        </div>
      </div>

      <div className="dashboard-chart">
        <h2>Data Table</h2>
        <DataTable data={filteredData} maxHeight={400} />
      </div>
    </div>
  );
}

