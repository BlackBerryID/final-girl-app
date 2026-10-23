export type MarkedOption = {
  name: string
  epic?: boolean
}

/** Keys are killer names from the killer list. */
export const DARK_POWERS_BY_KILLER: Record<string, readonly MarkedOption[]> = {
  'The Evomorph': [
    { name: 'Acid blood' },
    { name: 'Razor claws' },
    { name: 'Symbiotoc camouflage' },
    { name: 'Razor tail', epic: true },
  ],
  Berith: [
    { name: 'Lamb to the slaughter' },
    { name: 'Keeping Ursula alive' },
    { name: 'Rejecting God' },
    { name: 'Satanic influence', epic: true },
  ],
}

/** Keys are killer names from the killer list. */
export const FINALES_BY_KILLER: Record<string, readonly MarkedOption[]> = {
  'The Evomorph': [
    { name: 'Death in the dark' },
    { name: 'The perfect organism' },
    { name: 'Blitz of death' },
    { name: 'Impenetrable armor', epic: true },
  ],
  Berith: [
    { name: 'Spiritual attack' },
    { name: 'Hell on earth' },
    { name: 'It wants you!' },
    { name: 'Legions of hell', epic: true },
  ],
}

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

export function markedOptionsForKiller(
  options: Record<string, readonly MarkedOption[]>,
  killer: string | null | undefined,
): readonly MarkedOption[] {
  if (!killer) return []
  const items = options[killer] ?? []
  return [...items.filter((option) => option.epic !== true), ...items.filter((option) => option.epic === true)]
}

export function optionsForKiller(
  options: Record<string, readonly MarkedOption[]>,
  killer: string | null | undefined,
): readonly string[] {
  return markedOptionsForKiller(options, killer).map((option) => option.name)
}

export function isEpicOption(
  options: Record<string, readonly MarkedOption[]>,
  killer: string | null | undefined,
  name: string | null | undefined,
): boolean {
  if (!name) return false
  return markedOptionsForKiller(options, killer).some((option) => option.epic === true && option.name === name)
}
