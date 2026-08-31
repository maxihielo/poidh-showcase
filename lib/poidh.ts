/**
 * poidh data layer.
 *
 * We read poidh's OWN public bounty feed directly — no third-party API, no
 * database of our own — so this showcase has as few moving parts as possible and
 * keeps working as long as poidh does. (For deeper querying poidh also exposes an
 * indexer at https://indexer.poidh.xyz/swagger, and the bounties live on-chain on
 * Base / Arbitrum / Degen / Ethereum if you want a fully trustless read.)
 *
 * Feed:   https://poidh.xyz/bounties/data?limit=N   -> { items: Bounty[], nextCursor }
 * Single: https://poidh.xyz/[chain]/bounty/[id]/data (adds claims[])
 */

export const POIDH_BASE = 'https://poidh.xyz';

export type Bounty = {
  id: number;
  onChainId: number;
  chainId: number;
  title: string;
  description: string;
  amount: string; // native token amount, numeric string
  priceUsd: number; // USD value of the amount
  currency?: string;
  issuer: string; // 0x address
  createdAt: number; // unix seconds
  inProgress: boolean;
  isJoinedBounty?: boolean;
  isCanceled: boolean;
  isMultiplayer: boolean;
  isVoting: boolean;
  hasClaims: boolean;
  hasParticipants?: boolean;
  url: string;
};

export type Feed = { items: Bounty[]; nextCursor?: string | null };

export type Claim = {
  claimId?: number | string;
  imageUrl?: string;
  issuerAddress?: string;
  issuerName?: string;
  farcasterHandle?: string;
  twitterHandle?: string;
  title?: string;
  description?: string;
};

export type BountyDetail = Bounty & { claims: Claim[] };

export type ChainInfo = {
  id: number;
  name: string;
  short: string; // path segment used by poidh.xyz/[chain]/...
  native: string; // native token symbol
  explorer: string;
  color: string;
};

export const CHAINS: Record<number, ChainInfo> = {
  8453: { id: 8453, name: 'Base', short: 'base', native: 'ETH', explorer: 'https://basescan.org', color: '#3b82f6' },
  42161: { id: 42161, name: 'Arbitrum', short: 'arbitrum', native: 'ETH', explorer: 'https://arbiscan.io', color: '#28a0f0' },
  666666666: { id: 666666666, name: 'Degen', short: 'degen', native: 'DEGEN', explorer: 'https://explorer.degen.tips', color: '#a36efd' },
  1: { id: 1, name: 'Ethereum', short: 'ethereum', native: 'ETH', explorer: 'https://etherscan.io', color: '#627eea' },
};

export function chainOf(chainId: number): ChainInfo {
  return (
    CHAINS[chainId] ?? {
      id: chainId,
      name: `Chain ${chainId}`,
      short: String(chainId),
      native: 'ETH',
      explorer: '',
      color: '#64748b',
    }
  );
}

/** Fetch the recent open-bounty feed. Server-side (avoids CORS), cached briefly. */
export async function fetchBounties(limit = 100): Promise<Bounty[]> {
  const res = await fetch(`${POIDH_BASE}/bounties/data?limit=${limit}`, {
    // Fresh-ish without hammering poidh: revalidate every 60s.
    next: { revalidate: 60 },
    headers: { accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`poidh feed ${res.status}`);
  const data = (await res.json()) as Feed | Bounty[];
  const items = Array.isArray(data) ? data : data.items ?? [];
  // Only real, still-open bounties belong in a showcase.
  return items.filter((b) => b && !b.isCanceled);
}

export const CHAIN_BY_SHORT: Record<string, ChainInfo> = Object.fromEntries(
  Object.values(CHAINS).map((c) => [c.short, c]),
);

/** Fetch a single bounty (with its claims/submissions) by chain short-name + id. */
export async function fetchBountyDetail(chainShort: string, id: string | number): Promise<BountyDetail | null> {
  const res = await fetch(`${POIDH_BASE}/${chainShort}/bounty/${id}/data`, {
    next: { revalidate: 60 },
    headers: { accept: 'application/json' },
  });
  if (!res.ok) return null;
  const b = (await res.json()) as BountyDetail;
  if (!b || typeof b.id === 'undefined') return null;
  b.claims = Array.isArray(b.claims) ? b.claims : [];
  return b;
}

/** Internal detail-page path for a bounty. */
export function bountyPath(b: { chainId: number; id: number }): string {
  return `/bounty/${chainOf(b.chainId).short}/${b.id}`;
}

// ---- formatting helpers (no dependencies) ----

export function usd(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  if (n >= 1000) return `$${Math.round(n).toLocaleString('en-US')}`;
  return `$${n.toFixed(2)}`;
}

export function nativeAmount(b: Bounty): string {
  const n = Number(b.amount);
  const sym = b.currency || chainOf(b.chainId).native;
  if (!Number.isFinite(n)) return `${b.amount} ${sym}`;
  const s = n < 1 ? n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '') : n.toLocaleString('en-US', { maximumFractionDigits: 3 });
  return `${s} ${sym}`;
}

export function shortAddr(a: string): string {
  return a && a.length > 10 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function timeAgo(unixSeconds: number): string {
  const s = Math.max(0, Math.floor(Date.now() / 1000 - unixSeconds));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export type Status = 'voting' | 'claims' | 'open';

export function statusOf(b: Bounty): Status {
  if (b.isVoting) return 'voting';
  if (b.hasClaims) return 'claims';
  return 'open';
}
