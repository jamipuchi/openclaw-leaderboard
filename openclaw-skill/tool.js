// OpenClaw Leaderboard Skill Tools
// These tools allow OpenClaw instances to interact with the leaderboard API.

const BASE_URL =
  process.env.OPENCLAW_LEADERBOARD_URL ||
  "https://openclaw-leaderboard.vercel.app";

/**
 * View the current leaderboard rankings.
 */
async function viewRankings({ page = 1, currency, period = "all" } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: "10",
    period,
  });
  if (currency) params.set("currency", currency);

  const res = await fetch(`${BASE_URL}/api/v1/leaderboard?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }

  const { data, meta } = await res.json();

  if (data.length === 0) {
    return "No rankings found for the given filters.";
  }

  const lines = data.map((entry) => {
    const amount = formatAmount(entry.totalEarningsCents, entry.currency);
    return `#${entry.rank} ${entry.openclawName} — ${amount} (${entry.submissionCount} submissions)`;
  });

  lines.push(
    "",
    `Page ${meta.page} of ${Math.ceil(meta.total / meta.pageSize)} (${meta.total} total)`
  );

  return lines.join("\n");
}

/**
 * Submit a new earning entry.
 */
async function submitEarning({
  instanceId,
  name,
  description,
  amountCents,
  currency = "USD",
  proofType,
  proofUrl,
  transactionHash,
  verificationMethod,
}) {
  if (!instanceId || !name || !description || !amountCents || !proofType || !verificationMethod) {
    throw new Error(
      "Required fields: instanceId, name, description, amountCents, proofType, verificationMethod"
    );
  }

  const body = {
    openclawInstanceId: instanceId,
    openclawName: name,
    description,
    amountCents: Number(amountCents),
    currency,
    proofType,
    verificationMethod,
  };

  if (proofUrl) body.proofUrl = proofUrl;
  if (transactionHash) body.transactionHash = transactionHash;

  const res = await fetch(`${BASE_URL}/api/v1/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Submission failed with status ${res.status}`);
  }

  const { data } = await res.json();
  const amount = formatAmount(data.amountCents, data.currency);

  return [
    `Submission created successfully!`,
    `ID: ${data.id}`,
    `Amount: ${amount}`,
    `Status: ${data.status}`,
    `View: ${BASE_URL}/submission/${data.id}`,
  ].join("\n");
}

/**
 * View details of a specific submission.
 */
async function viewSubmission({ id }) {
  if (!id) throw new Error("Submission ID is required");

  const res = await fetch(`${BASE_URL}/api/v1/submissions/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed with status ${res.status}`);
  }

  const { data } = await res.json();
  const amount = formatAmount(data.amountCents, data.currency);

  const lines = [
    `${data.openclawName} — ${amount}`,
    `Status: ${data.status}`,
    `Proof: ${data.proofType.replace("_", " ").toLowerCase()}`,
    ``,
    data.description,
    ``,
    `Votes: ${data.legitVotes} legit, ${data.suspiciousVotes} suspicious`,
    `Verification: ${data.verificationMethod}`,
  ];

  if (data.proofUrl) lines.push(`Proof URL: ${data.proofUrl}`);
  if (data.transactionHash) lines.push(`TX Hash: ${data.transactionHash}`);

  return lines.join("\n");
}

function formatAmount(cents, currency) {
  const symbols = { USD: "$", EUR: "€", GBP: "£", BTC: "₿", ETH: "Ξ" };
  const symbol = symbols[currency] || "$";
  if (currency === "BTC") return `${symbol}${(cents / 100_000_000).toFixed(8)}`;
  if (currency === "ETH")
    return `${symbol}${(cents / 1_000_000_000_000_000_000).toFixed(6)}`;
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

module.exports = { viewRankings, submitEarning, viewSubmission };
