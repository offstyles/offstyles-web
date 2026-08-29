import OffstylesApi from '@/api/offstylesApi';
import type { Time } from '@/types/Time';

// Fastest other replay on the same map/style; #2 when the given time is the WR.
export async function fetchCompareReplayRef(current: Time): Promise<string | null> {
  if (!current.replay_ref) return null;
  try {
    const page = await OffstylesApi.getTimes({
      scope: { kind: 'map', map: current.map },
      style: current.style,
      has_replay: true,
      best: true,
      sort: 'Fastest',
      page: 1,
      limit: 2,
    });
    const other = page.data.find((t) => t._id !== current._id && t.replay_ref);
    return other?.replay_ref ?? null;
  } catch (err) {
    console.error('Failed to fetch comparison replay:', err);
    return null;
  }
}
