"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { format, subDays, addDays, isSameDay } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Truck,
  SearchX,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { type KajliTruckEntries } from "@/lib/actions/kajli.actions";

interface KajliEntryListProps {
  data: KajliTruckEntries[];
  currentDate: Date;
}

export default function KajliEntryList({
  data,
  currentDate,
}: KajliEntryListProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = React.useState(false);

  const updateDate = (newDate: Date) => {
    setIsNavigating(true);
    router.push(`?date=${newDate.toISOString()}`);
  };

  React.useEffect(() => {
    setIsNavigating(false);
  }, [data]);

  const onPrevDay = () => updateDate(subDays(currentDate, 1));
  const onNextDay = () => updateDate(addDays(currentDate, 1));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "IN":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "OUT":
        return "bg-orange-500/15 text-orange-400 border-orange-500/30";
      case "IN-COMPLETE":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "OUT-COMPLETE":
        return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="w-full space-y-4 font-sans">
      {/* --- Date Navigation --- */}
      <div className="flex items-center justify-between bg-zinc-900/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-md">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
              {format(currentDate, "MMMM do, yyyy")}
            </h2>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              {isSameDay(currentDate, new Date())
                ? "Today's Log"
                : "Historical Log"}
            </p>
          </div>
          {isNavigating && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-500 ml-2" />
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevDay}
            disabled={isNavigating}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="h-4 w-px bg-zinc-800 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextDay}
            disabled={isNavigating || isSameDay(currentDate, new Date())}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* --- Data Table --- */}
      <Card
        className={`bg-zinc-900 border-zinc-800 shadow-xl overflow-hidden rounded-xl transition-opacity duration-200 ${
          isNavigating ? "opacity-50" : "opacity-100"
        }`}
      >
        <CardContent className="p-0">
          <div className="relative max-h-150 overflow-auto">
            {/* Added w-full and fixed layout for consistent column widths */}
            <Table className="w-full border-separate border-spacing-0 [&_td]:border-b [&_td]:border-zinc-800 [&_th]:border-b [&_th]:border-zinc-800">
              <TableHeader className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="w-[10%] text-zinc-400 font-medium pl-6">
                    Time
                  </TableHead>
                  <TableHead className="w-[20%] text-zinc-400 font-medium">
                    Truck Number
                  </TableHead>
                  <TableHead className="w-[10%] text-center text-zinc-400 font-medium">
                    Godown
                  </TableHead>
                  <TableHead className="w-[15%] text-center text-zinc-400 font-medium">
                    Cargo
                  </TableHead>
                  <TableHead className="w-[15%] text-center text-zinc-400 font-medium">
                    Bags
                  </TableHead>
                  <TableHead className="w-[20%] text-center text-zinc-400 font-medium">
                    Loading Status
                  </TableHead>
                  <TableHead className="w-[25%] text-right text-zinc-400 font-medium pr-6">
                    Truck Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-500 gap-2">
                        <SearchX className="w-8 h-8 opacity-50" />
                        <p>No entries found for this date.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow
                      key={item.id}
                      className="group hover:bg-zinc-800/40 transition-all border-none"
                    >
                      <TableCell className="font-mono text-zinc-400 text-xs pl-6">
                        {format(new Date(item.createdAt!), "HH:mm")}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                          <span className="font-semibold text-zinc-200 uppercase tracking-wide">
                            {item.truckNumber}
                          </span>
                        </div>
                      </TableCell>

                      {/* Center Aligned Godown */}
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-zinc-800 text-zinc-300 text-sm font-medium">
                          {item.godownNumber}
                        </span>
                      </TableCell>

                      {/* Center Aligned Cargo */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="border-zinc-700 text-zinc-300 bg-zinc-950/50 hover:bg-zinc-800"
                        >
                          {item.cargoType}
                        </Badge>
                      </TableCell>
                      {/* Center Aligned Cargo */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="border-zinc-700 text-zinc-300 bg-zinc-950/50 hover:bg-zinc-800"
                        >
                          {item.bags}
                        </Badge>
                      </TableCell>

                      {/* Center Aligned Loading Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            item.loadingStatus
                          )} border`}
                        >
                          {item.loadingStatus}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            item.truckStatus
                          )} border`}
                        >
                          {item.truckStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
