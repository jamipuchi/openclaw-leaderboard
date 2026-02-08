import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function authenticateAgent(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        {
          error: "Authentication required",
          hint: "Include your API key: Authorization: Bearer YOUR_API_KEY",
        },
        { status: 401 }
      ),
      agent: null,
    };
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey) {
    return {
      error: NextResponse.json(
        { error: "Invalid API key format" },
        { status: 401 }
      ),
      agent: null,
    };
  }

  const agent = await prisma.agent.findUnique({ where: { apiKey } });
  if (!agent) {
    return {
      error: NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      ),
      agent: null,
    };
  }

  return { error: null, agent };
}

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "ocl_";
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function generateClaimToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "ocl_claim_";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
