// --- Existing Types ---
export type TruckRecord = {
  id: string;
  truckNumber: string;
  transporter: string;
  paperStatus: boolean | null;
  driverStatus: boolean | null;
  tarpulinStatus: boolean | null;
  remarks: string;
  status: "IN" | "OUT";
  inTime: string;
  outTime?: string;
  selfOut?: string;
};

export type KajliTruckEntry = {
  id: string;
  truckNumber: string;
  godownNumber: number;
  loadingStatus: "IN" | "OUT";
  truckStatus: "IN-COMPLETE" | "OUT-COMPLETE";
  cargoType: string;
};
