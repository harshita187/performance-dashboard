"use client";

import { memo, useCallback } from "react";
import { AggregationPeriod } from "@/lib/types";

interface TimeRangeSelectorProps {
  periods: AggregationPeriod[];
  selectedPeriod: AggregationPeriod["type"];
  onPeriodChange: (period: AggregationPeriod["type"]) => void;
}

function TimeRangeSelectorComponent({
  periods,
  selectedPeriod,
  onPeriodChange,
}: TimeRangeSelectorProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onPeriodChange(event.target.value as AggregationPeriod["type"]);
    },
    [onPeriodChange]
  );

  return (
    <div className="time-range-selector">
      <label htmlFor="period-select" className="time-range-label">
        Aggregation Period:
      </label>
      <select
        id="period-select"
        value={selectedPeriod}
        onChange={handleChange}
        className="time-range-select"
      >
        {periods.map((period) => (
          <option key={period.type} value={period.type}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export const TimeRangeSelector = memo(TimeRangeSelectorComponent);
