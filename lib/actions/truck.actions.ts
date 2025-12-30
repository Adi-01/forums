"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { TruckRecord } from "@/types";
import { formatVehicleNumber } from "../utils";

// 1. FETCH DATA (GET)
export async function getDashboardData() {
  try {
    const { databases } = await createAdminClient();

    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.nightCheckingTableId,
      [
        Query.orderDesc("$createdAt"), // Show newest first
        Query.limit(20), // Limit as requested
      ]
    );

    // Map Appwrite documents to your TruckRecord type
    const mappedRecords: TruckRecord[] = res.documents.map((doc: any) => ({
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
      inTime: new Date(doc.$createdAt).toLocaleString(),
      outTime:
        doc.Status === "OUT"
          ? new Date(doc.$updatedAt).toLocaleString()
          : undefined,
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
    const { databases } = await createAdminClient();

    const res = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.nightCheckingTableId,
      documentId,
      {
        Status: "OUT",
      }
    );

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
    const { databases } = await createAdminClient();

    const res = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.nightCheckingTableId,
      data.documentId,
      {
        TruckNumber: formatVehicleNumber(data.TruckNumber),
        TransporterName: data.TransporterName,
        PaperStatus: data.PaperStatus,
        DriverStatus: data.DriverStatus,
        TarpulinStatus: data.TarpulinStatus,
        Remarks: data.Remarks,
      }
    );

    return { success: true, data: res };
  } catch (error: any) {
    console.error("Error updating entry:", error);
    return { success: false, error: error?.message || "Failed to update" };
  }
}
