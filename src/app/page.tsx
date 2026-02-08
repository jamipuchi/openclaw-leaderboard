import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { StatsBar } from "@/components/stats-bar";
import { RecentSubmissions } from "@/components/recent-submissions";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column — Recent submissions feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Submissions</h2>
            </div>
            <RecentSubmissions />
          </div>

          {/* Right sidebar — Top earners + info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Top Earners</h2>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              <LeaderboardTable compact />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
