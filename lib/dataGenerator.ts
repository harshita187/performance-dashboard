import { DataPoint } from "./types";

export function generateDataPoint(
  timestamp: number,
  category: string = "default",
  baseValue: number = 100,
  variance: number = 20
): DataPoint {
  const timeOffset = timestamp / 1000;
  const sineValue = Math.sin(timeOffset * 0.1) * variance;
  const noise = (Math.random() - 0.5) * variance * 0.5;
  const value = baseValue + sineValue + noise;

  return {
    timestamp,
    value: Math.max(0, value),
    category,
    metadata: {
      generated: true,
    },
  };
}

export function generateInitialDataset(count: number = 1000): DataPoint[] {
  const now = Date.now();
  const data: DataPoint[] = [];
  const categories = ["temperature", "pressure", "humidity", "voltage"];

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * 1000;
    const category = categories[i % categories.length];
    const baseValue = 50 + (i % 4) * 25;

    data.push(generateDataPoint(timestamp, category, baseValue, 15));
  }

  return data;
}

export function generateNewDataPoint(
  lastTimestamp: number,
  category?: string
): DataPoint {
  const timestamp = lastTimestamp + 100;
  const categories = ["temperature", "pressure", "humidity", "voltage"];
  const selectedCategory =
    category || categories[Math.floor(Math.random() * categories.length)];
  const baseValue = 50 + Math.floor(Math.random() * 4) * 25;

  return generateDataPoint(timestamp, selectedCategory, baseValue, 15);
}

export function aggregateData(
  data: DataPoint[],
  period: "1min" | "5min" | "1hour"
): DataPoint[] {
  const periodMs = {
    "1min": 60 * 1000,
    "5min": 5 * 60 * 1000,
    "1hour": 60 * 60 * 1000,
  }[period];

  const buckets = new Map<number, DataPoint[]>();

  for (const point of data) {
    const bucketTime = Math.floor(point.timestamp / periodMs) * periodMs;
    if (!buckets.has(bucketTime)) {
      buckets.set(bucketTime, []);
    }
    buckets.get(bucketTime)!.push(point);
  }

  const aggregated: DataPoint[] = [];
  for (const [timestamp, points] of buckets.entries()) {
    const avgValue =
      points.reduce((sum, p) => sum + p.value, 0) / points.length;
    aggregated.push({
      timestamp,
      value: avgValue,
      category: points[0].category,
      metadata: {
        aggregated: true,
        count: points.length,
      },
    });
  }

  return aggregated.sort((a, b) => a.timestamp - b.timestamp);
}

export function filterByTimeRange(
  data: DataPoint[],
  start: number,
  end: number
): DataPoint[] {
  return data.filter(
    (point) => point.timestamp >= start && point.timestamp <= end
  );
}

export function filterByCategory(
  data: DataPoint[],
  categories: string[]
): DataPoint[] {
  if (categories.length === 0) return data;
  return data.filter((point) => categories.includes(point.category));
}
