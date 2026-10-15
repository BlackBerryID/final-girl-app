export const FEATURE_FILMS = [
  {
    name: 'Into the Void',
    killer: 'The Evomorph',
    location: 'USS Konrad',
  },
  {
    name: 'Panic at Station 2891',
    killer: 'The Organism',
    location: 'Station 2891',
  },
  {
    name: 'A Knock at the Door',
    killer: 'The Intruders',
    location: 'Wingard Cottage',
  },
  {
    name: 'Madness in the Dark',
    killer: 'The Ratchet Lady',
    location: 'Wolfe Asylum',
  },
  {
    name: 'Hell to Pay',
    killer: 'Razorface',
    location: 'Hellscape',
  },
  {
    name: 'The Falconwood Files',
    killer: 'Slayer',
    location: 'Falconwood',
  },
  {
    name: 'The Marrek Murders',
    killer: 'The Tormentor',
    location: 'Marrek Warehouse',
  },
  {
    name: "Don't Make a Sound",
    killer: 'The Eyeless',
    location: 'Utopia',
  },
  {
    name: 'A Demon in the Shadows',
    killer: 'Berith',
    location: "L'Armes Abbey",
  },
  {
    name: 'The Raptor Games',
    killer: 'The Raptors',
    location: 'Isla Lagarto',
  },
] as const

export type FeatureFilm = (typeof FEATURE_FILMS)[number]

const EXTRA_KILLERS = ['Krampus'] as const

export const KILLERS = [...FEATURE_FILMS.map((film) => film.killer), ...EXTRA_KILLERS]
export const LOCATIONS = FEATURE_FILMS.map((film) => film.location)
export const FEATURE_FILM_OPTIONS = FEATURE_FILMS.map((film) => film.name)

export function findFeatureFilm(name: string): FeatureFilm | undefined {
  return FEATURE_FILMS.find((film) => film.name === name)
}

export function findFeatureFilmByPair(killer: string, location: string): FeatureFilm | undefined {
  return FEATURE_FILMS.find((film) => film.killer === killer && film.location === location)
}
