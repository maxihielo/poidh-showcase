import { ImageResponse } from 'next/og';
import { fetchBounties, usd } from '@/lib/poidh';

export const alt = 'poidh Bounty Explorer — live onchain bounties';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  let count = 0;
  let pool = 0;
  try {
    const bounties = await fetchBounties(150);
    count = bounties.length;
    pool = bounties.reduce((s, b) => s + (b.priceUsd || 0), 0);
  } catch {
    /* fall back to static text */
  }

  const chainDots = ['#3b82f6', '#28a0f0', '#a36efd', '#627eea'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background: 'linear-gradient(135deg, #0b0d12 0%, #171326 55%, #0b0d12 100%)',
          color: '#eef1f7',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 26, height: 26, borderRadius: 999, background: '#a36efd' }} />
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 2, opacity: 0.9 }}>poidh explorer</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>
            Live bounties across the onchain internet
          </div>
          {count > 0 ? (
            <div style={{ fontSize: 40, color: '#34d399', fontWeight: 700 }}>
              {`${usd(pool)} in open prizes · ${count} bounties`}
            </div>
          ) : (
            <div style={{ fontSize: 36, color: '#9aa3b8' }}>Base · Arbitrum · Degen · Ethereum</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {chainDots.map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 999, background: c }} />
            ))}
          </div>
          <div style={{ fontSize: 26, color: '#9aa3b8' }}>Base · Arbitrum · Degen · Ethereum</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
