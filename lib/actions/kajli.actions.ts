"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite"; // Adjust path as needed
import { appwriteConfig } from "@/lib/appwrite/config"; // Adjust path as needed
import { formatVehicleNumber } from "@/lib/utils"; // Adjust path if needed

// We exclude 'id' because Appwrite generates it
export type KajliTruckEntries = {
  id?: string;
  truckNumber: string;
  godownNumber: number;
  loadingStatus: "IN" | "OUT";
  truckStatus: string;
  cargoType: string;
  createdAt?: string;
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
