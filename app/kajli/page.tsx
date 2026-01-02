"use client";

import React, { useState, FormEvent } from "react";
import {
  Truck,
  Package,
  Warehouse,
  Activity,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// IMPORT YOUR SERVER ACTION HERE
// Adjust the path based on where you saved the server file (e.g., '@/app/actions' or '@/lib/actions')
import {
  createKajliTruckEntry,
  type KajliTruckEntries,
} from "@/lib/actions/kajli.actions";

// Constants for dropdowns
// 'as const' ensures TypeScript treats these as specific literals, not just strings
const CARGO_TYPES = ["LSA", "DSA", "RBC"] as const;
const LOADING_STATUSES = ["IN", "OUT"] as const;
const TRUCK_STATUSES = [
  "IN-COMPLETE",
  "OUT-COMPLETE",
  "IN-PENDING",
  "OUT-PENDING",
] as const;

// Form State Interface
interface FormState {
  truckNumber: string;
  godownNumber: number | "";
  loadingStatus: string;
  truckStatus: string;
  cargoType: string;
}

export default function KajliTruckEntryClient() {
  const [formData, setFormData] = useState<FormState>({
    truckNumber: "",
    godownNumber: "",
    loadingStatus: "",
    truckStatus: "",
    cargoType: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle standard input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "godownNumber" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  // Handle Select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Basic Validation
    if (
      !formData.truckNumber ||
      formData.godownNumber === "" ||
      !formData.loadingStatus ||
      !formData.truckStatus ||
      !formData.cargoType
    ) {
      alert("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      // 2. Prepare Payload
      // We explicitly cast the types here to match what the Server Action expects
      const payload: KajliTruckEntries = {
        truckNumber: formData.truckNumber,
        godownNumber: Number(formData.godownNumber),
        loadingStatus: formData.loadingStatus as "IN" | "OUT",
        truckStatus: formData.truckStatus as "IN-COMPLETE" | "OUT-COMPLETE",
        cargoType: formData.cargoType,
      };

      console.log("Submitting Payload:", payload);

      // 3. Call Server Action
      const result = await createKajliTruckEntry(payload);

      // 4. Handle Result
      if (result.success) {
        alert("Entry saved successfully!");

        // Reset Form
        setFormData({
          truckNumber: "",
          godownNumber: "",
          loadingStatus: "",
          truckStatus: "",
          cargoType: "",
        });
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 p-4 font-sans text-sm md:text-base">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 shadow-xl">
        <CardHeader className="space-y-1 pb-4 border-b border-zinc-800">
          <CardTitle className="text-xl md:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-500" />
            Kajli Truck Entry
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs md:text-sm">
            Enter details for incoming/outgoing logistics.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Truck Number */}
            <div className="space-y-2">
              <Label
                htmlFor="truckNumber"
                className="text-zinc-300 flex items-center gap-2"
              >
                <Truck className="w-4 h-4 text-zinc-500" /> Truck Number
              </Label>
              <Input
                id="truckNumber"
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleInputChange}
                placeholder="GJ01XY1234"
                className="bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-blue-500 placeholder:text-zinc-600 uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Godown Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="godownNumber"
                  className="text-zinc-300 flex items-center gap-2"
                >
                  <Warehouse className="w-4 h-4 text-zinc-500" /> Godown
                </Label>
                <Input
                  id="godownNumber"
                  name="godownNumber"
                  type="number"
                  value={formData.godownNumber}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-blue-500 placeholder:text-zinc-600"
                />
              </div>

              {/* Cargo Type */}
              <div className="space-y-2">
                <Label className="text-zinc-300 flex items-center gap-2">
                  <Package className="w-4 h-4 text-zinc-500" /> Cargo Type
                </Label>
                <Select
                  value={formData.cargoType}
                  onValueChange={(val) => handleSelectChange("cargoType", val)}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-blue-500">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    {CARGO_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading Status */}
            <div className="space-y-2">
              <Label className="text-zinc-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-500" /> Loading Status
              </Label>
              <Select
                value={formData.loadingStatus}
                onValueChange={(val) =>
                  handleSelectChange("loadingStatus", val)
                }
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-blue-500">
                  <SelectValue placeholder="Status..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  {LOADING_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Truck Status */}
            <div className="space-y-2">
              <Label className="text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-zinc-500" /> Truck Status
              </Label>
              <Select
                value={formData.truckStatus}
                onValueChange={(val) => handleSelectChange("truckStatus", val)}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-blue-500">
                  <SelectValue placeholder="Completion..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  {TRUCK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Create Truck Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
