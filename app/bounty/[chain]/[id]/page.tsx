import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  fetchBountyDetail,
  chainOf,
  usd,
  nativeAmount,
  shortAddr,
  timeAgo,
  statusOf,
} from '@/lib/poidh';

export const revalidate = 60;

type Params = { chain: string; id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { chain, id } = await params;
  const b = await fetchBountyDetail(chain, id);
  if (!b) return { title: 'Bounty not found · poidh explorer' };
  const title = `${b.title} · ${usd(b.priceUsd)} bounty`;
  const description = (b.description || '').slice(0, 180);
  return { title, description, openGraph: { title, description }, twitter: { card: 'summary_large_image', title, description } };
}

export default async function BountyPage({ params }: { params: Promise<Params> }) {
  const { chain, id } = await params;
  const b = await fetchBountyDetail(chain, id);
  if (!b) notFound();

  const c = chainOf(b.chainId);
  const st = statusOf(b);
  const claims = b.claims || [];

  return (
    <main>
      <div className="wrap detail">
        <Link href="/" className="back">← All bounties</Link>

        <div className="detail-head">
          <div>
            <div className="badges" style={{ marginBottom: 10 }}>
              <span className="badge chain" style={{ borderColor: c.color, background: `${c.color}22` }}>{c.name}</span>
              {st === 'voting' && <span className="badge voting">Voting</span>}
              {st === 'claims' && <span className="badge claims">{claims.length} submission{claims.length === 1 ? '' : 's'}</span>}
              {b.isMultiplayer && <span className="badge multi">Multiplayer</span>}
            </div>
            <h1 className="detail-title">{b.title || 'Untitled bounty'}</h1>
            <p className="detail-meta">Posted by {shortAddr(b.issuer)} · {timeAgo(b.createdAt)}</p>
          </div>
          <div className="detail-value">
            <div className="usd">{usd(b.priceUsd)}</div>
            <div className="native">{nativeAmount(b)}</div>
            <a className="cta" href={b.url} target="_blank" rel="noopener noreferrer">Claim on poidh ↗</a>
          </div>
        </div>

        {b.description ? <p className="detail-desc">{b.description}</p> : null}

        <h2 className="section-h">Submissions {claims.length ? `(${claims.length})` : ''}</h2>
        {claims.length === 0 ? (
          <p className="empty">No submissions yet — this one’s wide open. Be the first to claim it.</p>
        ) : (
          <div className="claims-grid">
            {claims.map((cl, i) => {
              const who = cl.issuerName || (cl.farcasterHandle && `@${cl.farcasterHandle}`) || (cl.twitterHandle && `@${cl.twitterHandle}`) || shortAddr(cl.issuerAddress || '');
              return (
                <div key={cl.claimId ?? i} className="claim-card">
                  {cl.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="claim-img" src={cl.imageUrl} alt={cl.title || 'submission'} loading="lazy" />
                  ) : (
                    <div className="claim-img placeholder">no image</div>
                  )}
                  <div className="claim-body">
                    {cl.title ? <div className="claim-title">{cl.title}</div> : null}
                    {cl.description ? <div className="claim-desc">{cl.description}</div> : null}
                    {who ? <div className="claim-who">{who}</div> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <footer>
        <div className="wrap">
          Data from <a href="https://poidh.xyz" target="_blank" rel="noopener noreferrer">poidh.xyz</a>. Claiming happens on poidh. Open source (MIT).
        </div>
      </footer>
    </main>
  );
}
