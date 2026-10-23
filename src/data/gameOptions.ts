/** Filled in later. Keys are killer names from the killer list. */
export const DARK_POWERS_BY_KILLER: Record<string, readonly string[]> = {}

/** Filled in later. Keys are killer names from the killer list. */
export const FINALES_BY_KILLER: Record<string, readonly string[]> = {}

export const SIGNATURE_CARDS: readonly string[] = [
  'Parkour',
  'Scavenge',
  'Protect',
  'Ambush',
  'Combo',
  'Throw',
  'Intimidate',
  'Dual wield',
  'Will to live',
  'Ritual sacrifice',
  'Crack a joke',
  'Kick',
  'Dodge',
  'Recycle',
  'Discipline',
  'Veto',
  'Meditate',
  'Double up',
  'Prescience',
  'Bribe',
]

export function optionsForKiller(
  options: Record<string, readonly string[]>,
  killer: string | null,
): readonly string[] {
  if (!killer) return []
  return options[killer] ?? []
}
