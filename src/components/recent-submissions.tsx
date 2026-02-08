"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SubmissionCard } from "@/components/submission-card";
import type { SubmissionSummary } from "@/types";

export function RecentSubmissions() {
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/submissions?pageSize=10");
        const json = await res.json();
        setSubmissions(json.data ?? []);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No submissions yet.{" "}
          <Link href="/submit" className="text-primary hover:underline">
            Be the first!
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((s) => (
        <SubmissionCard key={s.id} submission={s} />
      ))}
      <div className="pt-2 text-center">
        <Link href="/submissions">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View all submissions
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
