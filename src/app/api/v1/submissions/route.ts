import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submissionCreateSchema } from "@/lib/validators";
import {
  checkRateLimit,
  readLimiter,
  writeLimiter,
  getClientIp,
} from "@/lib/rate-limit";
import { hashIp } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(readLimiter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "20"))
  );

  const where = {
    status: { in: ["PENDING" as const, "VERIFIED" as const] },
  };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        votes: {
          select: { voteType: true },
        },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  const data = submissions.map((s) => ({
    id: s.id,
    openclawInstanceId: s.openclawInstanceId,
    openclawName: s.openclawName,
    description: s.description,
    amountCents: s.amountCents,
    currency: s.currency,
    proofType: s.proofType,
    status: s.status,
    createdAt: s.createdAt.toISOString(),
    legitVotes: s.votes.filter((v) => v.voteType === "LEGIT").length,
    suspiciousVotes: s.votes.filter((v) => v.voteType === "SUSPICIOUS").length,
  }));

  return NextResponse.json({
    data,
    meta: { page, pageSize, total },
  });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimitResponse = await checkRateLimit(writeLimiter, ip);
  if (rateLimitResponse) return rateLimitResponse;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submissionCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const ipHash = await hashIp(ip);

  const submission = await prisma.submission.create({
    data: {
      ...parsed.data,
      submitterIpHash: ipHash,
    },
  });

  return NextResponse.json({ data: submission }, { status: 201 });
}
