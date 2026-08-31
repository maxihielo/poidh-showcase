import { NextRequest, NextResponse } from 'next/server';
import { fetchBounties } from '@/lib/poidh';

/**
 * Thin proxy over poidh's own feed so the client can refresh without hitting a
 * cross-origin wall. We add nothing and store nothing — poidh remains the source
 * of truth.
 */
export async function GET(req: NextRequest) {
  const limitParam = Number(req.nextUrl.searchParams.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 300) : 100;
  try {
    const bounties = await fetchBounties(limit);
    return NextResponse.json({ bounties, fetchedAt: Date.now() });
  } catch (err) {
    console.error('[bounties] feed error:', err);
    return NextResponse.json({ bounties: [], error: 'feed_unavailable' }, { status: 502 });
  }
}
