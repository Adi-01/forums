"use server";

import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { TruckRecord } from "@/types";
import { formatVehicleNumber } from "../utils";

// 1. FETCH DATA (GET)
export async function getDashboardData() {
  try {
    const { tables } = await createAdminClient();

    const res = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.nightCheckingTableId,
      queries: [
        Query.orderDesc("$createdAt"), // Show newest first
        Query.limit(20), // Limit as requested
      ],
    });

    // Map Appwrite documents to your TruckRecord type
    const mappedRecords: TruckRecord[] = res.rows.map((doc: any) => ({
      id: doc.$id,
      truckNumber: doc.TruckNumber,
      transporter: doc.TransporterName,
      paperStatus: doc.PaperStatus,
      driverStatus: doc.DriverStatus,
      tarpulinStatus: doc.TarpulinStatus,
      remarks: doc.Remarks,
      status: doc.Status,
      selfOut: doc.SelfOut || undefined,
      // Map system timestamps to your specific time fields
      inTime: doc.$createdAt,
      outTime: doc.Status === "OUT" ? doc.$updatedAt : undefined,
    }));

    return {
      success: true,
      data: mappedRecords,
    };
  } catch (error: any) {
    console.error("Error fetching dashboard data:", error);
    return {
      success: false,
      data: [],
      error: error?.message || "Failed to fetch data",
    };
  }
}

// 2. MARK EXIT (UPDATE) - Reusing/Refining for this context
export async function markTruckExit(documentId: string) {
  try {
    const { tables } = await createAdminClient();

    const res = await tables.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.nightCheckingTableId,
      rowId: documentId,
      data: {
        Status: "OUT",
      },
    });

    return {
      success: true,
      data: res,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to update status",
    };
  }
}

// ... existing imports

type UpdateEntryParams = {
  documentId: string;
  TruckNumber: string;
  TransporterName: string;
  PaperStatus: boolean | null;
  DriverStatus: boolean | null;
  TarpulinStatus: boolean | null;
  Remarks: string;
};

export async function updateTruckEntry(data: UpdateEntryParams) {
  try {
    const { tables } = await createAdminClient();

    const res = await tables.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.nightCheckingTableId,
      rowId: data.documentId,
      data: {
        TruckNumber: formatVehicleNumber(data.TruckNumber),
        TransporterName: data.TransporterName,
        PaperStatus: data.PaperStatus,
        DriverStatus: data.DriverStatus,
        TarpulinStatus: data.TarpulinStatus,
        Remarks: data.Remarks,
      },
    });

    return { success: true, data: res };
  } catch (error: any) {
    console.error("Error updating entry:", error);
    return { success: false, error: error?.message || "Failed to update" };
  }
}
