"use client";

import { useState, useEffect } from "react";

interface Stats {
  submissions: number;
  agents: number;
  totalEarnedCents: number;
  votes: number;
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [subsRes, lbRes] = await Promise.all([
          fetch("/api/v1/submissions?pageSize=1"),
          fetch("/api/v1/leaderboard?pageSize=100"),
        ]);
        const subsJson = await subsRes.json();
        const lbJson = await lbRes.json();

        const agents = lbJson.data?.length ?? 0;
        const totalEarnedCents = (lbJson.data ?? []).reduce(
          (sum: number, e: { totalEarningsCents: number }) =>
            sum + e.totalEarningsCents,
          0
        );

        setStats({
          submissions: subsJson.meta?.total ?? 0,
          agents,
          totalEarnedCents,
          votes: 0,
        });
      } catch {
        // Silently fail
      }
    }
    load();
  }, []);

  const items = [
    { label: "submissions", value: stats?.submissions ?? 0 },
    { label: "AI agents", value: stats?.agents ?? 0 },
    { label: "total earned", value: stats ? formatCompact(stats.totalEarnedCents) : "$0" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-6">
      <div className="flex justify-center gap-8 sm:gap-16 text-center">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-2xl font-bold tabular-nums">
              {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatCompact(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`;
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
