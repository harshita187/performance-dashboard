"use client";

import { memo, useMemo } from "react";
import { DataPoint } from "@/lib/types";
import { useVirtualization } from "@/hooks/useVirtualization";
import { formatTimestamp, formatValue } from "@/lib/canvasUtils";

interface DataTableProps {
  data: DataPoint[];
  maxHeight?: number;
}

function DataTableComponent({ data, maxHeight = 400 }: DataTableProps) {
  const itemHeight = 40;
  
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.timestamp - a.timestamp);
  }, [data]);

  const { containerRef, visibleItems: visibleRows, totalHeight, offsetY } =
    useVirtualization(sortedData, {
      itemHeight,
      containerHeight: maxHeight,
      overscan: 5,
    });

  return (
    <div className="data-table-container" style={{ maxHeight }}>
      <div className="data-table-header">
        <div className="data-table-cell">Timestamp</div>
        <div className="data-table-cell">Value</div>
        <div className="data-table-cell">Category</div>
      </div>
      <div
        ref={containerRef}
        className="data-table-body"
        style={{
          height: Math.min(totalHeight, maxHeight),
          overflow: "auto",
        }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {visibleRows.map((item, index) => {
              return (
                <div key={`${item.timestamp}-${index}`} className="data-table-row">
                  <div className="data-table-cell">
                    {formatTimestamp(item.timestamp)}
                  </div>
                  <div className="data-table-cell">
                    {formatValue(item.value)}
                  </div>
                  <div className="data-table-cell">{item.category}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const DataTable = memo(DataTableComponent);

