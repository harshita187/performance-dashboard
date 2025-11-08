import { generateInitialDataset } from "@/lib/dataGenerator";
import { DataProvider } from "@/components/providers/DataProvider";
import Dashboard from "@/components/Dashboard";

export default async function DashboardPage() {
  const initialData = generateInitialDataset(1000);

  return (
    <DataProvider initialData={initialData}>
      <Dashboard />
    </DataProvider>
  );
}

