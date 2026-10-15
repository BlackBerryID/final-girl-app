import aKnockAtTheDoor from '../assets/featurFilms/a-knock-at-the-door.webp'
import dontMakeASound from '../assets/featurFilms/dont-make-a-sound.webp'
import hellToPay from '../assets/featurFilms/hell-to-pay.webp'
import intoTheVoid from '../assets/featurFilms/into-the-void.webp'
import madnessInTheDark from '../assets/featurFilms/madness-in-the-dark.webp'
import panicAtStation2891 from '../assets/featurFilms/panic-at-station-2891.webp'
import theFalconwoodFiles from '../assets/featurFilms/the-falconwood-files.webp'
import theMarrekMurders from '../assets/featurFilms/the-marrek-murders.webp'
import theRaptorGames from '../assets/featurFilms/the-raptor-games.webp'
import berith from '../assets/killers/Berith.webp'
import evomorph from '../assets/killers/Evomorph.webp'
import eyeless from '../assets/killers/Eyeless.webp'
import intruders from '../assets/killers/Intruders.webp'
import krampus from '../assets/killers/krampus.jpg'
import organism from '../assets/killers/Organism.webp'
import raptors from '../assets/killers/Raptors.webp'
import ratchetLady from '../assets/killers/Ratchet-Lady.webp'
import razorface from '../assets/killers/Razorface.webp'
import slayer from '../assets/killers/Slayer.webp'
import tormentor from '../assets/killers/Tormentor.webp'
import falconwood from '../assets/locations/falconwood.jpg'
import hellscape from '../assets/locations/hellscape.jpg'
import islaLagarto from '../assets/locations/isla-lagarto.jpg'
import larmesAbbey from '../assets/locations/larmes-abbey.webp'
import marrekWarehouse from '../assets/locations/marrek-warehouse.jpg'
import station2891 from '../assets/locations/station-2891.jpg'
import ussKonrad from '../assets/locations/uss-konrad.jpg'
import utopia from '../assets/locations/utopia.jpg'
import wingardCottage from '../assets/locations/wingard-cottage.jpg'
import wolfeAsylum from '../assets/locations/wolfe-asylum.jpg'

const FEATURE_FILM_IMAGES: Record<string, string> = {
  'Into the Void': intoTheVoid,
  'Panic at Station 2891': panicAtStation2891,
  'A Knock at the Door': aKnockAtTheDoor,
  'Madness in the Dark': madnessInTheDark,
  'Hell to Pay': hellToPay,
  'The Falconwood Files': theFalconwoodFiles,
  'The Marrek Murders': theMarrekMurders,
  "Don't Make a Sound": dontMakeASound,
  'The Raptor Games': theRaptorGames,
}

const KILLER_IMAGES: Record<string, string> = {
  'The Evomorph': evomorph,
  'The Organism': organism,
  'The Intruders': intruders,
  'The Ratchet Lady': ratchetLady,
  Razorface: razorface,
  Slayer: slayer,
  'The Tormentor': tormentor,
  'The Eyeless': eyeless,
  Berith: berith,
  'The Raptors': raptors,
  Krampus: krampus,
}

const LOCATION_IMAGES: Record<string, string> = {
  'USS Konrad': ussKonrad,
  'Station 2891': station2891,
  'Wingard Cottage': wingardCottage,
  'Wolfe Asylum': wolfeAsylum,
  Hellscape: hellscape,
  Falconwood: falconwood,
  'Marrek Warehouse': marrekWarehouse,
  Utopia: utopia,
  "L'Armes Abbey": larmesAbbey,
  'Isla Lagarto': islaLagarto,
}

export function featureFilmImage(name: string | undefined): string | undefined {
  return name ? FEATURE_FILM_IMAGES[name] : undefined
}

export function killerImage(name: string | undefined): string | undefined {
  return name ? KILLER_IMAGES[name] : undefined
}

export function locationImage(name: string | undefined): string | undefined {
  return name ? LOCATION_IMAGES[name] : undefined
}
