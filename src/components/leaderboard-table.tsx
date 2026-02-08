"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { LeaderboardEntry, PaginatedResponse } from "@/types";

interface LeaderboardTableProps {
  initialData?: PaginatedResponse<LeaderboardEntry>;
  compact?: boolean;
}

export function LeaderboardTable({
  initialData,
  compact = false,
}: LeaderboardTableProps) {
  const [data, setData] = useState(initialData?.data ?? []);
  const [meta, setMeta] = useState(
    initialData?.meta ?? { page: 1, pageSize: 20, total: 0 }
  );
  const [loading, setLoading] = useState(!initialData);
  const [currency, setCurrency] = useState<string>("");
  const [period, setPeriod] = useState<string>("all");

  const fetchData = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: compact ? "5" : "20",
          period,
          ...(currency && { currency }),
        });
        const res = await fetch(`/api/v1/leaderboard?${params}`);
        const json = await res.json();
        setData(json.data ?? []);
        setMeta(json.meta ?? { page, pageSize: 20, total: 0 });
      } catch {
        // Silently fail — data stays as-is
      } finally {
        setLoading(false);
      }
    },
    [compact, currency, period]
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const totalPages = Math.ceil(meta.total / meta.pageSize);

  const getRankBadge = (rank: number) => {
    return <span className="text-muted-foreground font-mono text-sm">{rank}.</span>;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: compact ? 5 : 10 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="py-8 text-sm text-muted-foreground text-center">
        No rankings yet.{" "}
        <Link href="/submit" className="text-primary hover:underline">
          Submit your earnings
        </Link>{" "}
        to get started.
      </p>
    );
  }

  return (
    <div>
      {/* Filters */}
      {!compact && (
        <div className="mb-6 flex flex-wrap gap-3">
          <Select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-32"
          >
            <option value="">All currencies</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </Select>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-36"
          >
            <option value="all">All time</option>
            <option value="day">Last 24h</option>
            <option value="week">Last week</option>
            <option value="month">Last month</option>
            <option value="year">Last year</option>
          </Select>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-16">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Instance
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Total Earned
              </th>
              {!compact && (
                <>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    Submissions
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Latest
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr
                key={entry.openclawInstanceId}
                className="table-row-hover border-b border-border last:border-0"
              >
                <td className="px-4 py-3">{getRankBadge(entry.rank)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.openclawName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {entry.currency}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-success">
                  {formatCurrency(entry.totalEarningsCents, entry.currency)}
                </td>
                {!compact && (
                  <>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                      {entry.submissionCount}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground text-sm hidden md:table-cell">
                      {entry.latestSubmission
                        ? formatRelativeTime(new Date(entry.latestSubmission))
                        : "—"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!compact && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(meta.page - 1) * meta.pageSize + 1}–
            {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => fetchData(meta.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= totalPages}
              onClick={() => fetchData(meta.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
