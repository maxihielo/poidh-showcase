import { fetchBounties, usd, type Bounty } from '@/lib/poidh';
import Explorer from '@/components/Explorer';
import Rail from '@/components/Rail';

// Revalidate the whole page every 60s; the client can also refresh on demand.
export const revalidate = 60;

export default async function Home() {
  let bounties: Bounty[] = [];
  let error = false;
  try {
    bounties = await fetchBounties(150);
  } catch {
    error = true;
  }

  const totalPool = bounties.reduce((s, b) => s + (b.priceUsd || 0), 0);
  const top = [...bounties].sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0)).slice(0, 8);

  return (
    <main>
      <header className="masthead">
        <div className="wrap masthead-inner">
          <div className="brand">
            <span className="dot" />
            poidh explorer
          </div>
          <h1 className="title">
            Live bounties across <span className="grad">the onchain internet</span>
          </h1>
          <p className="subtitle">
            {bounties.length > 0 ? (
              <>
                <strong style={{ color: 'var(--text)' }}>{usd(totalPool)}</strong> in open prizes across{' '}
                <strong style={{ color: 'var(--text)' }}>{bounties.length}</strong> poidh bounties on Base,
                Arbitrum, Degen and Ethereum. Filter, sort, dig into submissions, and jump straight to the one
                you want to claim. Reads poidh’s own feed — no third-party backend.
              </>
            ) : (
              'Every open poidh bounty on Base, Arbitrum, Degen and Ethereum, in one place.'
            )}
          </p>
        </div>
      </header>

      <div className="wrap">
        {error ? (
          <p className="empty">Couldn’t reach the poidh feed right now. Try the refresh button in a moment.</p>
        ) : (
          <>
            {top.length > 0 && <Rail items={top} />}
            <Explorer initial={bounties} />
          </>
        )}
      </div>

      <footer>
        <div className="wrap">
          Data from{' '}
          <a href="https://poidh.xyz" target="_blank" rel="noopener noreferrer">poidh.xyz</a>’s public
          bounty feed. Claiming happens on poidh. Open source (MIT). Built for the poidh community.
        </div>
      </footer>
    </main>
  );
}
