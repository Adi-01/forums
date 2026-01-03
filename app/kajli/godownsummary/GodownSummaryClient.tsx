"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Warehouse,
  PlusCircle,
  RefreshCw,
  MinusCircle,
  Loader2, // Loading Spinner
  CheckCircle2, // Success Icon
  AlertCircle, // Error Icon
  Info, // Info Icon
} from "lucide-react";

import { createStockAdjustment } from "@/lib/actions/kajli.actions";

// --- Types ---
export type GodownData = {
  id: number;
  lsa: { bags: number; mt: number };
  dsa: { bags: number; mt: number };
  rbc: { bags: number; mt: number };
};

interface Props {
  initialData: GodownData[];
}

export default function GodownSummaryClient({ initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // Handles loading state for Server Actions

  // UI State
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  // Feedback Dialog State (Replaces window.alert)
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Adjustment Logic State
  const [selectedGodown, setSelectedGodown] = useState<number | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<string>("");
  const [quantityInput, setQuantityInput] = useState("");
  const [adjustmentMode, setAdjustmentMode] = useState<"add" | "remove">("add");

  // --- Calculations ---
  const getRowTotal = (row: GodownData) => ({
    bags: row.lsa.bags + row.dsa.bags + row.rbc.bags,
    mt: row.lsa.mt + row.dsa.mt + row.rbc.mt,
  });

  const grandTotal = initialData.reduce(
    (acc, row) => {
      const rowTot = getRowTotal(row);
      return {
        lsaBags: acc.lsaBags + (row.lsa.bags ?? 0),
        lsaMt: acc.lsaMt + (row.lsa.mt ?? 0),
        dsaBags: acc.dsaBags + (row.dsa.bags ?? 0),
        dsaMt: acc.dsaMt + (row.dsa.mt ?? 0),
        rbcBags: acc.rbcBags + (row.rbc.bags ?? 0),
        rbcMt: acc.rbcMt + (row.rbc.mt ?? 0),
        totalBags: acc.totalBags + rowTot.bags,
        totalMt: acc.totalMt + rowTot.mt,
      };
    },
    {
      lsaBags: 0,
      lsaMt: 0,
      dsaBags: 0,
      dsaMt: 0,
      rbcBags: 0,
      rbcMt: 0,
      totalBags: 0,
      totalMt: 0,
    }
  );

  // --- Helpers ---

  // Wrapper to show feedback dialog
  const showFeedback = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  // Close feedback dialog
  const closeFeedback = () => {
    setFeedback((prev) => ({ ...prev, isOpen: false }));
  };

  // --- Handlers ---
  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleCellDoubleClick = (godownId: number, cargoType: string) => {
    setSelectedGodown(godownId);
    setSelectedCargo(cargoType);
    setQuantityInput("");
    setAdjustmentMode("add");
    setIsAdjustmentOpen(true);
  };

  const submitAdjustment = async () => {
    if (!selectedGodown || !selectedCargo || !quantityInput) {
      showFeedback("error", "Missing Input", "Please enter a valid quantity.");
      return;
    }

    // Close adjustment modal immediately to show loading on main screen (or keep it open with loader)
    // Here we keep it open and show loader on button

    const rawQty = Number(quantityInput);
    const finalQty = adjustmentMode === "remove" ? -rawQty : rawQty;

    // Execute Server Action inside Transition
    startTransition(async () => {
      try {
        const result = await createStockAdjustment({
          godownNumber: selectedGodown,
          cargoType: selectedCargo,
          quantity: finalQty,
        });

        if (result.success) {
          setIsAdjustmentOpen(false);
          showFeedback(
            "success",
            "Adjustment Saved",
            `Successfully updated ${selectedCargo} stock for Godown ${selectedGodown}.`
          );
          // router.refresh() is handled automatically if revalidatePath is used in server action,
          // but calling it here inside transition ensures UI stays synced.
          router.refresh();
        } else {
          showFeedback(
            "error",
            "Adjustment Failed",
            result.error || "Unknown error occurred."
          );
        }
      } catch (error) {
        console.error(error);
        showFeedback(
          "error",
          "System Error",
          "Something went wrong while connecting to the server."
        );
      }
    });
  };

  return (
    <div className="w-full bg-black/20 p-4 rounded-xl border border-zinc-800 space-y-4 select-none">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <Warehouse className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-zinc-100">Stock Summary</h2>
          <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-500 ml-2 border border-zinc-700">
            <Info className="w-3 h-3 inline mr-1 mb-0.5" />
            Double-click cells to adjust
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.replace("/kajli")}
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            disabled={isPending}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New Entry
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isPending}
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 min-w-25"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isPending ? "Updating" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* --- 1. ADJUSTMENT DIALOG --- */}
      <Dialog
        open={isAdjustmentOpen}
        onOpenChange={(open) => !isPending && setIsAdjustmentOpen(open)}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Adjust Stock
              <span className="text-blue-500 font-mono">{selectedCargo}</span>
              <span className="text-zinc-500 text-sm font-normal">
                (Godown {selectedGodown})
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Mode Selection */}
            <div className="space-y-3">
              <Label className="text-zinc-400">Action</Label>
              <RadioGroup
                defaultValue="add"
                value={adjustmentMode}
                onValueChange={(v: "add" | "remove") => setAdjustmentMode(v)}
                className="grid grid-cols-2 gap-4"
                disabled={isPending}
              >
                <div>
                  <RadioGroupItem
                    value="add"
                    id="add"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="add"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-950 p-4 hover:bg-zinc-900 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:text-blue-500 cursor-pointer transition-all opacity-100 peer-disabled:opacity-50"
                  >
                    <PlusCircle className="mb-2 h-6 w-6" />
                    Add Stock
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="remove"
                    id="remove"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="remove"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-zinc-700 bg-zinc-950 p-4 hover:bg-zinc-900 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:text-red-500 cursor-pointer transition-all opacity-100 peer-disabled:opacity-50"
                  >
                    <MinusCircle className="mb-2 h-6 w-6" />
                    Remove Stock
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity (Bags)</Label>
              <Input
                id="qty"
                type="number"
                placeholder="0"
                className="bg-zinc-950 border-zinc-700 text-lg font-bold text-center h-12 text-zinc-100"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                disabled={isPending}
                autoFocus
              />
              <p className="text-xs text-zinc-500 text-center">
                {adjustmentMode === "remove"
                  ? "Subtracting from inventory."
                  : "Adding to inventory."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={submitAdjustment}
              disabled={isPending}
              className={`w-full font-semibold relative ${
                adjustmentMode === "remove"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isPending && (
                <Loader2 className="h-4 w-4 animate-spin absolute left-4" />
              )}
              {isPending
                ? "Saving..."
                : adjustmentMode === "remove"
                ? "Confirm Removal"
                : "Confirm Addition"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- 2. FEEDBACK DIALOG (Replaces Alerts) --- */}
      <Dialog open={feedback.isOpen} onOpenChange={closeFeedback}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-xs text-center">
          <div className="flex justify-center mb-2">
            {feedback.type === "success" && (
              <div className="h-12 w-12 rounded-full bg-green-900/30 flex items-center justify-center ring-1 ring-green-500/50">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            )}
            {feedback.type === "error" && (
              <div className="h-12 w-12 rounded-full bg-red-900/30 flex items-center justify-center ring-1 ring-red-500/50">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
            )}
          </div>

          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {feedback.title}
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400">
              {feedback.message}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={closeFeedback}
              className="mt-2 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DATA TABLE --- */}
      <div
        className={`rounded-lg border border-zinc-800 overflow-hidden overflow-x-auto transition-opacity duration-300 ${
          isPending ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      >
        <Table className="text-center text-sm min-w-200">
          <TableHeader>
            <TableRow className="border-b border-zinc-800 hover:bg-transparent">
              <TableHead
                rowSpan={2}
                className="bg-zinc-900 text-zinc-300 font-bold border-r border-zinc-800 w-20 text-center"
              >
                GD NO.
              </TableHead>
              <TableHead
                colSpan={2}
                className="bg-emerald-950/50 text-emerald-400 font-bold border-r border-zinc-800 text-center h-10"
              >
                LSA
              </TableHead>
              <TableHead
                colSpan={2}
                className="bg-rose-950/50 text-rose-400 font-bold border-r border-zinc-800 text-center"
              >
                DSA
              </TableHead>
              <TableHead
                colSpan={2}
                className="bg-violet-950/50 text-violet-400 font-bold border-r border-zinc-800 text-center"
              >
                RBC
              </TableHead>
              <TableHead
                colSpan={2}
                className="bg-amber-950/50 text-amber-400 font-bold text-center"
              >
                TOTAL
              </TableHead>
            </TableRow>
            <TableRow className="border-b border-zinc-800 hover:bg-transparent">
              {/* Units Row */}
              <TableHead className="bg-emerald-900/20 text-emerald-200/70 border-r border-zinc-800 text-center h-8 text-xs">
                BAGS
              </TableHead>
              <TableHead className="bg-emerald-900/20 text-emerald-200/70 border-r border-zinc-800 text-center text-xs">
                MT
              </TableHead>
              <TableHead className="bg-rose-900/20 text-rose-200/70 border-r border-zinc-800 text-center text-xs">
                BAGS
              </TableHead>
              <TableHead className="bg-rose-900/20 text-rose-200/70 border-r border-zinc-800 text-center text-xs">
                MT
              </TableHead>
              <TableHead className="bg-violet-900/20 text-violet-200/70 border-r border-zinc-800 text-center text-xs">
                BAGS
              </TableHead>
              <TableHead className="bg-violet-900/20 text-violet-200/70 border-r border-zinc-800 text-center text-xs">
                MT
              </TableHead>
              <TableHead className="bg-amber-900/20 text-amber-200/70 border-r border-zinc-800 text-center text-xs">
                BAGS
              </TableHead>
              <TableHead className="bg-amber-900/20 text-amber-200/70 text-center text-xs">
                MT
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="bg-zinc-950">
            {initialData.map((row) => {
              const total = getRowTotal(row);
              return (
                <TableRow
                  key={row.id}
                  className="border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors"
                >
                  <TableCell className="font-bold border-r border-zinc-800 bg-zinc-900/30 text-blue-400">
                    {row.id}
                  </TableCell>

                  {/* Interactive Cells */}
                  <TableCell
                    className="border-r border-zinc-800 text-zinc-300 cursor-pointer hover:bg-emerald-900/30 hover:text-white transition-colors"
                    onDoubleClick={() => handleCellDoubleClick(row.id, "LSA")}
                    title="Double click to adjust LSA stock"
                  >
                    {row.lsa.bags}
                  </TableCell>
                  <TableCell className="border-r border-zinc-800 text-zinc-400 font-mono">
                    {row.lsa.mt.toFixed(3)}
                  </TableCell>

                  <TableCell
                    className="border-r border-zinc-800 text-zinc-300 cursor-pointer hover:bg-rose-900/30 hover:text-white transition-colors"
                    onDoubleClick={() => handleCellDoubleClick(row.id, "DSA")}
                    title="Double click to adjust DSA stock"
                  >
                    {row.dsa.bags}
                  </TableCell>
                  <TableCell className="border-r border-zinc-800 text-zinc-400 font-mono">
                    {row.dsa.mt.toFixed(3)}
                  </TableCell>

                  <TableCell
                    className="border-r border-zinc-800 text-zinc-300 cursor-pointer hover:bg-violet-900/30 hover:text-white transition-colors"
                    onDoubleClick={() => handleCellDoubleClick(row.id, "RBC")}
                    title="Double click to adjust RBC stock"
                  >
                    {row.rbc.bags}
                  </TableCell>
                  <TableCell className="border-r border-zinc-800 text-zinc-400 font-mono">
                    {row.rbc.mt.toFixed(3)}
                  </TableCell>

                  {/* Totals */}
                  <TableCell className="border-r border-zinc-800 font-medium text-emerald-400 bg-emerald-950/10">
                    {total.bags}
                  </TableCell>
                  <TableCell className="font-medium text-emerald-400 font-mono bg-emerald-950/10">
                    {total.mt.toFixed(3)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

          {/* Footer */}
          <TableFooter className="bg-zinc-900 border-t border-zinc-700">
            <TableRow className="hover:bg-zinc-900">
              <TableCell className="text-center font-black text-amber-500 tracking-wider">
                G.TOTAL
              </TableCell>
              <TableCell className="text-center text-zinc-100 font-bold">
                {grandTotal.lsaBags}
              </TableCell>
              <TableCell className="text-center text-zinc-100 font-mono">
                {grandTotal.lsaMt.toFixed(2)}
              </TableCell>
              <TableCell className="text-center text-zinc-100 font-bold">
                {grandTotal.dsaBags}
              </TableCell>
              <TableCell className="text-center text-zinc-100 font-mono">
                {grandTotal.dsaMt.toFixed(3)}
              </TableCell>
              <TableCell className="text-center text-zinc-100 font-bold">
                {grandTotal.rbcBags}
              </TableCell>
              <TableCell className="text-center text-zinc-100 font-mono">
                {grandTotal.rbcMt.toFixed(3)}
              </TableCell>
              <TableCell className="text-center text-amber-400 font-bold bg-amber-950/20 border-l border-zinc-800">
                {grandTotal.totalBags}
              </TableCell>
              <TableCell className="text-center text-amber-400 font-mono bg-amber-950/20">
                {grandTotal.totalMt.toFixed(3)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
