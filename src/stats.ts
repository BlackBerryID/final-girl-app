import type { Entry } from './types.ts'

export type KillerStat = {
  killer: string
  games: number
  wins: number
  winRate: number
}

/** Without all locations, only games that have a feature film are counted. */
export function killerStats(entries: Entry[], includeAllLocations: boolean): KillerStat[] {
  const totals = new Map<string, { games: number; wins: number }>()

  for (const entry of entries) {
    if (!entry.killer) continue
    if (!includeAllLocations && !entry.featureFilm) continue

    const total = totals.get(entry.killer) ?? { games: 0, wins: 0 }
    total.games += 1
    if (entry.result === true) total.wins += 1
    totals.set(entry.killer, total)
  }

  return [...totals.entries()].map(([killer, total]) => ({
    killer,
    games: total.games,
    wins: total.wins,
    winRate: total.games === 0 ? 0 : (total.wins / total.games) * 100,
  }))
}
