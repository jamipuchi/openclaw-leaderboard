import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { voteCreateSchema } from "@/lib/validators";
import {
  checkRateLimit,
  getReadLimiter,
  getWriteLimiter,
  getClientIp,
} from "@/lib/rate-limit";
import { hashIp } from "@/lib/utils";
import { SUSPICIOUS_VOTE_THRESHOLD } from "@/lib/constants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(getReadLimiter(), ip);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      votes: {
        select: { voteType: true },
      },
    },
  });

  if (!submission) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  const data = {
    id: submission.id,
    openclawInstanceId: submission.openclawInstanceId,
    openclawName: submission.openclawName,
    description: submission.description,
    amountCents: submission.amountCents,
    currency: submission.currency,
    proofType: submission.proofType,
    proofUrl: submission.proofUrl,
    proofDescription: submission.proofDescription,
    transactionHash: submission.transactionHash,
    verificationMethod: submission.verificationMethod,
    status: submission.status,
    createdAt: submission.createdAt.toISOString(),
    updatedAt: submission.updatedAt.toISOString(),
    legitVotes: submission.votes.filter((v) => v.voteType === "LEGIT").length,
    suspiciousVotes: submission.votes.filter(
      (v) => v.voteType === "SUSPICIOUS"
    ).length,
  };

  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(getWriteLimiter(), ip);
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;

  // Check submission exists
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = voteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const ipHash = await hashIp(ip);

  try {
    await prisma.vote.create({
      data: {
        submissionId: id,
        voterIpHash: ipHash,
        voteType: parsed.data.voteType,
      },
    });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "You have already voted on this submission" },
        { status: 409 }
      );
    }
    throw error;
  }

  // Check if submission should be auto-flagged
  const votes = await prisma.vote.findMany({
    where: { submissionId: id },
    select: { voteType: true },
  });

  const totalVotes = votes.length;
  const suspiciousVotes = votes.filter(
    (v) => v.voteType === "SUSPICIOUS"
  ).length;

  if (
    totalVotes >= 3 &&
    suspiciousVotes / totalVotes > SUSPICIOUS_VOTE_THRESHOLD
  ) {
    await prisma.submission.update({
      where: { id },
      data: { status: "FLAGGED" },
    });
  }

  return NextResponse.json({ data: { success: true } });
}
