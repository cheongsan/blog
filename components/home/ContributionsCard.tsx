import React, { useEffect, useState } from "react";
import { CONFIG } from "site.config";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Contribution {
  date: string | null;
  count: number;
  color: string;
}

const CACHE_KEY = "contributionsCache_v2";

export default function ContributionsCard() {
  const empty = () => Array(53).fill(null).map(() =>
    Array(7).fill({ date: null, count: 0, color: "#ebedf0" })
  );

  const [grid, setGrid] = useState<Contribution[][]>(empty());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached && Array.isArray(JSON.parse(cached))) {
        setGrid(JSON.parse(cached));
        setLoading(false);
      } else {
        fetchData();
      }
    } catch {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `/api/contributions?github=${CONFIG.profile.github}&gitlab=${CONFIG.profile.gitlab}`
      );
      const data = await res.json();
      const g = empty();

      data.forEach((entry: any) => {
        const weekIndex = entry.weekIndex != null
          ? entry.weekIndex
          : Math.floor((new Date(entry.date + "T00:00:00").getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 / 7);
        const dayIndex = new Date(entry.date + "T00:00:00").getDay();
        if (weekIndex >= 0 && weekIndex < 53 && dayIndex >= 0 && dayIndex < 7) {
          g[weekIndex][dayIndex] = {
            date: entry.date,
            count: entry.count || 0,
            color: entry.color || "#ebedf0",
          };
        }
      });

      setGrid(g);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(g)); } catch {}
    } catch (e) {
      console.error("Failed to fetch contributions:", e);
    }
    setLoading(false);
  };

  return (
    <TooltipProvider>
      <div>
        {loading ? (
          <div className="h-32 w-full rounded-md bg-gray-200 animate-pulse" />
        ) : (
          <ScrollArea className="p-2 rounded-md border">
            <div style={{ overflowX: "auto", width: "100%" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(53, 11px)",
                gridTemplateRows: "repeat(7, 11px)", direction: "rtl" as const,
                gap: "3px",
              }}>
                {grid.map((week, wi) =>
                  week.map((day, di) => (
                    <Tooltip key={`${wi}-${di}`}>
                      <TooltipTrigger asChild>
                        <div style={{
                          gridColumnStart: wi + 1,
                          gridRowStart: di + 1,
                          width: 10, height: 10,
                          backgroundColor: day?.color || "#ebedf0",
                          borderRadius: 3,
                        }} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{day?.date || "No date"}</p>
                        <p>{day?.count > 0 ? `${day.count} contributions` : "No contributions"}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                )}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </TooltipProvider>
  );
}


