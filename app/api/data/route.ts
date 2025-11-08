import { NextResponse } from "next/server";
import { generateInitialDataset, generateNewDataPoint } from "@/lib/dataGenerator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get("count") || "1000", 10);
  const type = searchParams.get("type") || "initial";

  if (type === "initial") {
    const data = generateInitialDataset(count);
    return NextResponse.json({ data });
  }

  if (type === "new") {
    const lastTimestamp = parseInt(
      searchParams.get("lastTimestamp") || Date.now().toString(),
      10
    );
    const category = searchParams.get("category") || undefined;
    const newPoint = generateNewDataPoint(lastTimestamp, category);
    return NextResponse.json({ data: newPoint });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

