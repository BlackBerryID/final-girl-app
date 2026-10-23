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
  'The Intruders': [
    { name: 'Maskaphobia' },
    { name: 'Strength in numbers' },
    { name: 'No remorse' },
    { name: "Won't stay down", epic: true },
  ],
  'The Tormentor': [
    { name: 'Horrifying traps' },
    { name: 'Unfair traps' },
    { name: 'Overkill traps' },
    { name: 'Endless traps', epic: true },
  ],
  Slayer: [
    { name: 'Master plan' },
    { name: 'Renewed determination' },
    { name: 'Mind control' },
    { name: "It's in my head!", epic: true },
  ],
  Razorface: [
    { name: 'Life drain' },
    { name: 'Soulbound' },
    { name: 'Helleport' },
    { name: 'Infinite despair', epic: true },
  ],
  Krampus: [
    { name: 'Explosive gifts' },
    { name: 'Blood and cookies' },
    { name: 'Tantalizing gifts' },
    { name: 'Never ending gifts', epic: true },
  ],
  'The Ratchet Lady': [
    { name: 'Manic burst' },
    { name: 'Dark injection' },
    { name: 'Bloodfear' },
    { name: 'Shield of madness', epic: true },
  ],
  'The Eyeless': [
    { name: 'Quick counter' },
    { name: 'Hard skin' },
    { name: 'Reactive swipe' },
    { name: 'High alert', epic: true },
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
  'The Intruders': [
    { name: "You're gonna die" },
    { name: 'Release the beast' },
    { name: 'Hunt sweet hunt' },
    { name: 'We know where you live', epic: true },
  ],
  'The Tormentor': [
    { name: 'The ultimate trap' },
    { name: 'Game over!' },
    { name: 'No escape!' },
    { name: 'No rest for the weary', epic: true },
  ],
  Slayer: [
    { name: 'Interdimensional rift collapse' },
    { name: "Let's finish this" },
    { name: 'Welcome to my world' },
    { name: 'Your time is up', epic: true },
  ],
  Razorface: [
    { name: 'I feast on your pain' },
    { name: 'Taste our pleasures' },
    { name: 'Chains of torment' },
    { name: 'Legendary suffering', epic: true },
  ],
  Krampus: [
    { name: 'Bamf!' },
    { name: 'Soul lust' },
    { name: 'Unholy gifts' },
    { name: 'Past midnight', epic: true },
  ],
  'The Ratchet Lady': [
    { name: 'Hold her down' },
    { name: 'Feed the madness' },
    { name: "It's raining maniacs" },
    { name: 'Enter the madhouse', epic: true },
  ],
  'The Eyeless': [
    { name: 'It knows my moves!' },
    { name: 'No more running' },
    { name: 'It can hear everything!' },
    { name: 'Final slash', epic: true },
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
