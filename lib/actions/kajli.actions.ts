"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite"; // Adjust path as needed
import { appwriteConfig } from "@/lib/appwrite/config"; // Adjust path as needed
import { formatVehicleNumber } from "@/lib/utils"; // Adjust path if needed
import { revalidatePath } from "next/cache";
export type GodownData = {
  id: number;
  lsa: { bags: number; mt: number };
  dsa: { bags: number; mt: number };
  rbc: { bags: number; mt: number };
};

// We exclude 'id' because Appwrite generates it
export type KajliTruckEntries = {
  id?: string;
  truckNumber: string;
  godownNumber: number;
  loadingStatus: "IN" | "OUT";
  truckStatus: string;
  cargoType: string;
  createdAt?: string;
  bags: number;
};

export async function createKajliTruckEntry(data: KajliTruckEntries) {
  try {
    const { tables } = await createAdminClient();

    // ensure truck number is formatted (e.g., GJ01XY1234)
    const formattedTruckNumber = formatVehicleNumber(data.truckNumber);

    const res = await tables.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: "kajli_truck_entry",
      rowId: ID.unique(),
      data: {
        // Mapping the fields to match your KajliTruckEntry type
        TruckNumber: formattedTruckNumber,
        GodownNumber: data.godownNumber,
        LoadingStatus: data.loadingStatus,
        TruckStatus: data.truckStatus,
        CargoType: data.cargoType,
        Bags: data.bags,
      },
    });

    return {
      success: true,
      data: res,
    };
  } catch (error: any) {
    console.error("Error creating kajli truck entry:", error);
    return {
      success: false,
      data: null,
      error: error?.message || "Failed to create entry",
    };
  }
}

export async function getKajliTruckEntries(date?: Date) {
  try {
    const { tables } = await createAdminClient();

    // 1. Determine the Date Range
    // If no date is passed, default to "today"
    const targetDate = date || new Date();

    // Set start of the day (00:00:00.000)
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    // Set end of the day (23:59:59.999)
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Fetch from Appwrite
    const res = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: "kajli_truck_entry", // Your Table ID
      queries: [
        // Filter: Created after or at start of day
        Query.greaterThanEqual("$createdAt", startOfDay.toISOString()),
        // Filter: Created before or at end of day
        Query.lessThanEqual("$createdAt", endOfDay.toISOString()),
        // Sort: Newest entries first
        Query.orderDesc("$createdAt"),
        // Limit: Adjust as needed (Appwrite default is usually 25)
        Query.limit(100),
      ],
    });

    // 3. Map and Return Data
    const entries: KajliTruckEntries[] = res.rows.map((doc: any) => ({
      id: doc.$id,
      // Map database PascalCase fields to your camelCase type
      truckNumber: doc.TruckNumber,
      godownNumber: doc.GodownNumber,
      loadingStatus: doc.LoadingStatus,
      truckStatus: doc.TruckStatus,
      cargoType: doc.CargoType,
      createdAt: doc.$createdAt,
      bags: doc.Bags,
    }));

    return {
      success: true,
      data: entries,
    };
  } catch (error: any) {
    console.error("Error fetching kajli truck entries:", error);
    return {
      success: false,
      data: [],
      error: error?.message || "Failed to fetch entries",
    };
  }
}

export type SummaryResult = {
  success: boolean;
  data: GodownData[];
  error?: string;
};

// --- Helper: MT Conversion (20 Bags = 1 MT) ---
const calculateMT = (bags: number) => Number((bags * 0.05).toFixed(3));
const FIXED_GODOWN_IDS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11];

export async function getGodownStockSummary(): Promise<SummaryResult> {
  try {
    // 1. Initialize Client
    const { tables } = await createAdminClient();

    // 2. Define Queries (Don't await them yet!)
    // We explicitly select ONLY the columns we need to save bandwidth (Network Optimization)
    const truckPromise = tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: "kajli_truck_entry",
      queries: [
        Query.limit(5000), // Max limit to reduce pagination calls
        Query.select(["GodownNumber", "CargoType", "Bags"]), // Bandwidth Saver: Fetch only 3 small fields
      ],
    });

    const adjPromise = tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: "adjustment_table",
      queries: [
        Query.limit(5000),
        Query.select(["GodownNumber", "CargoType", "Bags"]), // Bandwidth Saver
      ],
    });

    // 3. Execute in Parallel (Speed Optimization)
    // This waits for the *slowest* request, rather than the sum of both
    const [truckRes, adjRes] = await Promise.all([truckPromise, adjPromise]);

    // 4. Initialize Map (Pre-fill)
    const godownMap = new Map<number, GodownData>();

    FIXED_GODOWN_IDS.forEach((id) => {
      godownMap.set(id, {
        id,
        lsa: { bags: 0, mt: 0 },
        dsa: { bags: 0, mt: 0 },
        rbc: { bags: 0, mt: 0 },
      });
    });

    const getGodown = (id: number) => {
      if (!godownMap.has(id)) return null;
      return godownMap.get(id)!;
    };

    // 5. Shared Processing Logic
    // Since the structure of both results is identical (thanks to Query.select),
    // we can use a single helper to process both arrays.
    const processRows = (rows: any[]) => {
      rows.forEach((row) => {
        const gdNum = Number(row.GodownNumber);
        const cargo = row.CargoType ? row.CargoType.toLowerCase() : "";

        let bags = Number(row.Bags);
        if (isNaN(bags) || row.Bags === null) bags = 0;

        if (!gdNum || !cargo) return;

        const currentGd = getGodown(gdNum);
        if (!currentGd) return;

        if (cargo === "lsa") currentGd.lsa.bags += bags;
        else if (cargo === "dsa") currentGd.dsa.bags += bags;
        else if (cargo === "rbc") currentGd.rbc.bags += bags;
      });
    };

    // Process both datasets
    processRows(truckRes.rows);
    processRows(adjRes.rows);

    // 6. Final Sort
    const finalData: GodownData[] = Array.from(godownMap.values())
      .map((gd) => ({
        ...gd,
        lsa: { bags: gd.lsa.bags, mt: calculateMT(gd.lsa.bags) },
        dsa: { bags: gd.dsa.bags, mt: calculateMT(gd.dsa.bags) },
        rbc: { bags: gd.rbc.bags, mt: calculateMT(gd.rbc.bags) },
      }))
      .sort((a, b) => a.id - b.id);

    return {
      success: true,
      data: finalData,
    };
  } catch (error: any) {
    console.error("Error calculating stock summary:", error);
    return {
      success: false,
      data: [],
      error: error?.message || "Failed to calculate stock summary",
    };
  }
}

// --- Types ---
export type CreateAdjustmentParams = {
  godownNumber: number;
  cargoType: string;
  quantity: number; // Can be positive (add) or negative (subtract)
};

export async function createStockAdjustment(params: CreateAdjustmentParams) {
  try {
    const { databases } = await createAdminClient();

    // 1. Create the Document
    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      "adjustment_table", // Replace with your actual Adjustment Table ID if different
      ID.unique(),
      {
        // These keys must match your Appwrite Database Attributes exactly
        GodownNumber: params.godownNumber,
        CargoType: params.cargoType,
        Bags: params.quantity,
      }
    );

    // 2. Revalidate Cache
    // This forces the "Godown Summary" page to reload data next time it's visited
    revalidatePath("/kajli/godownsummary");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating adjustment:", error);
    return {
      success: false,
      error: error?.message || "Failed to create adjustment",
    };
  }
}
