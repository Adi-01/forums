"use server";

import { Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { revalidatePath } from "next/cache";
import { TruckRecord } from "@/types";
import { formatVehicleNumber } from "../utils";

// 1. FETCH ALL ENTRIES (For Admin Table)
export async function getAllTrucks(search?: string) {
  try {
    const { databases } = await createAdminClient();

    // Build queries
    const queries = [
      Query.orderDesc("$createdAt"),
      Query.limit(100), // Fetch more for admin view
    ];

    if (search) {
      queries.push(Query.search("TruckNumber", search));
    }

    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.nightCheckingTableId,
      queries
    );

    // Map to your type
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
      inTime: new Date(doc.$createdAt).toISOString(),
      outTime:
        doc.Status === "OUT"
          ? new Date(doc.$updatedAt).toISOString()
          : undefined,
    }));

    return { success: true, data: mappedRecords };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

// 2. ADMIN UPDATE (Can edit everything, including statuses)
export async function updateTruckAdmin(
  documentId: string,
  data: Partial<TruckRecord>
) {
  try {
    const { databases } = await createAdminClient();

    const payload: any = {
      Remarks: data.remarks,
    };

    // Only add fields if they are present in the update object
    if (data.truckNumber)
      payload.TruckNumber = formatVehicleNumber(data.truckNumber);
    if (data.transporter) payload.TransporterName = data.transporter;
    if (data.paperStatus !== undefined) payload.PaperStatus = data.paperStatus;
    if (data.driverStatus !== undefined)
      payload.DriverStatus = data.driverStatus;
    if (data.tarpulinStatus !== undefined)
      payload.TarpulinStatus = data.tarpulinStatus;
    if (data.selfOut) payload.SelfOut = data.selfOut; // Admin can manually fix times
    if (data.status) payload.Status = data.status; // Admin can reopen/close tickets

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.nightCheckingTableId,
      documentId,
      payload
    );

    revalidatePath("/nightchecking/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
