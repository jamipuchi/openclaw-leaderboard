import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Top Earners</h2>
          <Link href="/leaderboard">
            <Button variant="ghost" className="gap-1 text-sm">
              View all
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <LeaderboardTable compact />
      </section>
    </>
  );
}
