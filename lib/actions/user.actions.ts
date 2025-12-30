"use server";

import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite"; // Adjust path to your client
import { appwriteConfig } from "@/lib/appwrite/config"; // Adjust path to your config
import { formatVehicleNumber } from "../utils";
import { cookies } from "next/headers";

// Type definition for the data coming from the frontend form
type CreateEntryParams = {
  TruckNumber: string;
  TransporterName: string;
  PaperStatus: boolean | null;
  DriverStatus: boolean | null;
  TarpulinStatus: boolean | null;
  Remarks: string;
};

/**
 * 1. CREATE ENTRY (IN)
 * Creates a new document. The '$createdAt' system field acts as the 'inTime'.
 */
export async function createTruckEntry(data: CreateEntryParams) {
  try {
    const { tables } = await createAdminClient();
    const formattedTruckNumber = formatVehicleNumber(data.TruckNumber);

    const res = await tables.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.nightCheckingTableId, // Replace with your Truck Entry Collection ID
      rowId: ID.unique(),
      data: {
        TruckNumber: formattedTruckNumber,
        TransporterName: data.TransporterName,
        PaperStatus: data.PaperStatus,
        DriverStatus: data.DriverStatus,
        TarpulinStatus: data.TarpulinStatus,
        Remarks: data.Remarks,
        Status: "IN", // Default status on creation
      },
    });

    return {
      success: true,
      data: res,
    };
  } catch (error: any) {
    console.error("Error creating truck entry:", error);
    return {
      success: false,
      data: null,
      error: error?.message || "Failed to create entry",
    };
  }
}

/**
 * 2. MARK EXIT (OUT)
 * Updates the status to 'OUT'. Appwrite automatically updates '$updatedAt',
 * which acts as the 'outTime'.
 */
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
    console.error("Error marking truck exit:", error);
    return {
      success: false,
      data: null,
      error: error?.message || "Failed to update status",
    };
  }
}

export async function updateTruckExitTime(documentId: string, newTime: string) {
  try {
    const { tables } = await createAdminClient();

    const res = await tables.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.nightCheckingTableId, // Ensure this matches your config key
      rowId: documentId,
      data: {
        SelfOut: newTime, // We only update this specific field
      },
    });

    return {
      success: true,
      data: res,
    };
  } catch (error: any) {
    console.error("Error updating exit time:", error);
    return {
      success: false,
      error: error?.message || "Failed to update time",
    };
  }
}

export async function loginAction(email: string, password: string) {
  try {
    const { account } = await createAdminClient();

    // Create email session
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });

    // Set session cookie (HttpOnly)
    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Login error:", error);

    return {
      success: false,
      error: error?.message || "Login failed",
    };
  }
}

export async function isLoggedIn() {
  const cookieStore = await cookies();
  return !!cookieStore.get("appwrite-session");
}
