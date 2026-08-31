'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  type Bounty,
  chainOf,
  bountyPath,
  usd,
  nativeAmount,
  shortAddr,
  timeAgo,
  statusOf,
} from '@/lib/poidh';

type SortKey = 'value_desc' | 'value_asc' | 'newest' | 'oldest';
type StatusFilter = 'all' | 'open' | 'claims' | 'voting';

export default function Explorer({ initial }: { initial: Bounty[] }) {
  const [bounties, setBounties] = useState<Bounty[]>(initial);
  const [q, setQ] = useState('');
  const [chain, setChain] = useState<number | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortKey>('value_desc');
  const [refreshing, setRefreshing] = useState(false);

  // Which chains actually appear, for the chip row.
  const chainsPresent = useMemo(() => {
    const ids = Array.from(new Set(bounties.map((b) => b.chainId)));
    ids.sort((a, b) => bounties.filter((x) => x.chainId === b).length - bounties.filter((x) => x.chainId === a).length);
    return ids;
  }, [bounties]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = bounties.filter((b) => {
      if (chain !== 'all' && b.chainId !== chain) return false;
      if (status !== 'all' && statusOf(b) !== status) return false;
      if (needle && !(`${b.title} ${b.description}`.toLowerCase().includes(needle))) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'value_desc': return (b.priceUsd || 0) - (a.priceUsd || 0);
        case 'value_asc': return (a.priceUsd || 0) - (b.priceUsd || 0);
        case 'newest': return (b.createdAt || 0) - (a.createdAt || 0);
        case 'oldest': return (a.createdAt || 0) - (b.createdAt || 0);
      }
    });
    return list;
  }, [bounties, q, chain, status, sort]);

  const stats = useMemo(() => {
    const totalUsd = filtered.reduce((s, b) => s + (b.priceUsd || 0), 0);
    const chains = new Set(filtered.map((b) => b.chainId)).size;
    const withClaims = filtered.filter((b) => b.hasClaims).length;
    return { count: filtered.length, totalUsd, chains, withClaims };
  }, [filtered]);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/bounties?limit=150', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.bounties)) setBounties(data.bounties);
    } catch {
      /* keep current data on failure */
    }
    setRefreshing(false);
  }

  return (
    <>
      <div className="stats">
        <div className="stat"><div className="n">{stats.count}</div><div className="l">Open bounties</div></div>
        <div className="stat"><div className="n">{usd(stats.totalUsd)}</div><div className="l">Total value</div></div>
        <div className="stat"><div className="n">{stats.chains}</div><div className="l">Chains</div></div>
        <div className="stat"><div className="n">{stats.withClaims}</div><div className="l">With submissions</div></div>
      </div>

      <div className="controls">
        <input
          className="search"
          placeholder="Search bounties…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search bounties"
        />
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Status filter">
          <option value="all">All statuses</option>
          <option value="open">Open · no submissions yet</option>
          <option value="claims">Has submissions</option>
          <option value="voting">Voting</option>
        </select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
          <option value="value_desc">Highest value</option>
          <option value="value_asc">Lowest value</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <button className="refresh" onClick={refresh} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
      </div>

      <div className="chips">
        <button className="chip" data-on={chain === 'all'} onClick={() => setChain('all')}>All chains</button>
        {chainsPresent.map((id) => {
          const c = chainOf(id);
          return (
            <button key={id} className="chip" data-on={chain === id} onClick={() => setChain(id)}>
              <span className="swatch" style={{ background: c.color }} />{c.name}
            </button>
          );
        })}
      </div>

      <p className="meta-line">Showing {filtered.length} of {bounties.length} open bounties · claiming happens on poidh</p>

      {filtered.length === 0 ? (
        <p className="empty">No bounties match those filters.</p>
      ) : (
        <div className="grid">
          {filtered.map((b) => {
            const c = chainOf(b.chainId);
            const st = statusOf(b);
            return (
              <Link key={`${b.chainId}-${b.id}`} className="card" href={bountyPath(b)}>
                <div className="card-top">
                  <div className="card-title">{b.title || 'Untitled bounty'}</div>
                  <div className="value">
                    <div className="usd">{usd(b.priceUsd)}</div>
                    <div className="native">{nativeAmount(b)}</div>
                  </div>
                </div>
                {b.description ? <div className="card-desc">{b.description}</div> : null}
                <div className="badges">
                  <span className="badge chain" style={{ borderColor: c.color, background: `${c.color}22` }}>{c.name}</span>
                  {st === 'voting' && <span className="badge voting">Voting</span>}
                  {st === 'claims' && <span className="badge claims">Has submissions</span>}
                  {b.isMultiplayer && <span className="badge multi">Multiplayer</span>}
                </div>
                <div className="card-foot">
                  <span>{shortAddr(b.issuer)} · {timeAgo(b.createdAt)}</span>
                  <span className="claim">View bounty →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
