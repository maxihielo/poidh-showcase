# poidh Bounty Explorer

A fast, open, dependency-light explorer for **live [poidh](https://poidh.xyz) bounties** across
Base, Arbitrum, Degen and Ethereum. Search, filter by chain, sort by value, and jump straight to the
bounty you want to claim.

Built for the **"Build a POIDH Bounty Showcase"** bounty.

## Why this fits the brief

- **Real poidh data.** Reads poidh's own public feed (`https://poidh.xyz/bounties/data`) live. No
  mock data.
- **No local setup to view.** Deploy once (Vercel or any Node host) and it's a public URL.
- **Few dependencies / resilient / hard to kill.** Only `next` + `react`. No database, no third-party
  API, no analytics, no wallet SDK. It has nothing of its own to go down — it keeps working as long as
  poidh does. (For deeper reads, poidh also exposes an indexer at
  `https://indexer.poidh.xyz/swagger`, and every bounty lives on-chain on Base / Arbitrum / Degen /
  Ethereum for a fully trustless source.)
- **Discover + understand + engage.** Stats strip (open count, total USD, chains, submissions),
  chain chips, status filter, sort, and search — then each card links out to poidh to claim
  (transactions stay on poidh, as suggested).
- **Quantity.** Pulls up to 150 recent open bounties across all chains in one view.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy

Any Next.js host works. Vercel:

```bash
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

No environment variables are required.

## How it works

- `lib/poidh.ts` — types, the four-chain map, the feed fetch, and small no-dependency formatters.
- `app/page.tsx` — server component; fetches the feed (revalidates every 60s) and renders the shell.
- `components/Explorer.tsx` — client component; search / chain / status filters, sort, live refresh,
  and the card grid.
- `app/api/bounties/route.ts` — a thin same-origin proxy over poidh's feed so the client "Refresh"
  button works without a CORS wall. It adds and stores nothing.

Data endpoints used (documented at https://docs.poidh.xyz):
- Feed: `GET https://poidh.xyz/bounties/data?limit=N` → `{ items, nextCursor }`
- Single bounty: `GET https://poidh.xyz/[chain]/bounty/[id]/data`

## Claiming the bounty (checklist)

- [ ] Deploy and grab the live URL
- [ ] Post it in a Farcaster cast (include the live app link)
- [ ] Submit on poidh with the live app link + the Farcaster cast link

## License

MIT.
