'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type Bounty, chainOf, bountyPath, usd } from '@/lib/poidh';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Rail({ items }: { items: Bounty[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, items.length]);

  function nudge(dir: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(260, el.clientWidth * 0.8), behavior: 'smooth' });
  }

  return (
    <section className="rail-wrap">
      <div className="rail-head">
        <h2 className="section-h">🏆 Biggest open bounties</h2>
        <div className="rail-nav">
          <button className="rail-arrow" onClick={() => nudge(-1)} disabled={!canLeft} aria-label="Scroll left">‹</button>
          <button className="rail-arrow" onClick={() => nudge(1)} disabled={!canRight} aria-label="Scroll right">›</button>
        </div>
      </div>
      <div className="rail-scroller">
        <div className="rail" ref={ref}>
          {items.map((b, i) => {
            const c = chainOf(b.chainId);
            return (
              <Link key={`${b.chainId}-${b.id}`} href={bountyPath(b)} className="rail-card">
                <span className="rank">{MEDALS[i] ?? `#${i + 1}`}</span>
                <span className="rail-usd">{usd(b.priceUsd)}</span>
                <span className="rail-title">{b.title || 'Untitled bounty'}</span>
                <span className="rail-chain" style={{ color: c.color }}>{c.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="rail-fade left" data-on={canLeft} aria-hidden="true" />
        <div className="rail-fade right" data-on={canRight} aria-hidden="true" />
      </div>
    </section>
  );
}
