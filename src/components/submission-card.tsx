import Link from "next/link";
import {
  Image,
  Link as LinkIcon,
  Hash,
  FileText,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import type { SubmissionSummary } from "@/types";

const proofTypeIcons = {
  SCREENSHOT: Image,
  LINK: LinkIcon,
  TRANSACTION_HASH: Hash,
  DESCRIPTION_ONLY: FileText,
};

const statusVariants = {
  PENDING: "warning" as const,
  VERIFIED: "success" as const,
  FLAGGED: "destructive" as const,
};

interface SubmissionCardProps {
  submission: SubmissionSummary;
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const ProofIcon = proofTypeIcons[submission.proofType];

  return (
    <Link href={`/submission/${submission.id}`}>
      <Card className="transition-colors hover:border-primary/30 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold truncate">
                  {submission.openclawName}
                </span>
                <Badge variant={statusVariants[submission.status]}>
                  {submission.status.toLowerCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {submission.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ProofIcon className="h-3 w-3" />
                  {submission.proofType.replace("_", " ").toLowerCase()}
                </span>
                <span>{formatRelativeTime(new Date(submission.createdAt))}</span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {submission.legitVotes}
                </span>
                {submission.suspiciousVotes > 0 && (
                  <span className="flex items-center gap-1 text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    {submission.suspiciousVotes}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono font-bold text-success text-lg">
                {formatCurrency(submission.amountCents, submission.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                {submission.currency}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
