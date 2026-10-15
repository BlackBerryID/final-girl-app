export type Entry = {
  id: string
  date?: string
  killer?: string
  location?: string
  featureFilm?: string
  hero?: string
  darkPower?: string
  finale?: string
  isHeroUltimateAbilityRevealed?: boolean
  isHeroWeaponUsed?: boolean
  signatureCard?: string
  result?: boolean
}

export type NewEntry = {
  date: string
  killer: string
  location: string
  featureFilm: string
  hero: string
  darkPower: string
  finale: string
  isHeroUltimateAbilityRevealed: boolean
  isHeroWeaponUsed: boolean
  signatureCard: string
  result: boolean
}

export type DatabaseData = {
  entries: Entry[]
}
