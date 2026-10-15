import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import {
  DARK_POWERS_BY_KILLER,
  FINALES_BY_KILLER,
  SIGNATURE_CARDS,
  optionsForKiller,
} from '../src/data/gameOptions.ts'
import { KILLERS, LOCATIONS, findFeatureFilmByPair } from '../src/data/featureFilms.ts'
import { HEROES } from '../src/data/heroes.ts'
import type { NewEntry } from '../src/types.ts'
import { addEntry, listEntries, removeEntry } from './db.ts'

const entriesPath = '/api/entries'

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })
    request.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    request.on('error', reject)
  })
}

function isListed(value: unknown, options: readonly string[]): value is string {
  return typeof value === 'string' && options.some((option) => option === value)
}

function parseIsoDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }
  return value
}

function parseListedOrEmpty(value: unknown, options: readonly string[]): string | null {
  if (value === undefined || value === null || value === '') return ''
  if (typeof value !== 'string' || !options.includes(value)) return null
  return value
}

function parseBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function parseNewEntry(value: unknown): NewEntry | null {
  if (typeof value !== 'object' || value === null) return null

  const record = value as Record<string, unknown>
  const date = parseIsoDate(record.date)
  if (!date || !isListed(record.killer, KILLERS) || !isListed(record.location, LOCATIONS)) {
    return null
  }
  if (!isListed(record.hero, HEROES)) return null

  let featureFilm = ''
  if (record.featureFilm !== '') {
    const matchedFilm = findFeatureFilmByPair(record.killer, record.location)
    if (!matchedFilm || record.featureFilm !== matchedFilm.name) return null
    featureFilm = matchedFilm.name
  }

  const darkPower = parseListedOrEmpty(record.darkPower, optionsForKiller(DARK_POWERS_BY_KILLER, record.killer))
  const finale = parseListedOrEmpty(record.finale, optionsForKiller(FINALES_BY_KILLER, record.killer))
  const signatureCard = parseListedOrEmpty(record.signatureCard, SIGNATURE_CARDS)
  const isHeroUltimateAbilityRevealed = parseBoolean(record.isHeroUltimateAbilityRevealed)
  const isHeroWeaponUsed = parseBoolean(record.isHeroWeaponUsed)
  const result = parseBoolean(record.result)
  if (
    darkPower === null ||
    finale === null ||
    signatureCard === null ||
    isHeroUltimateAbilityRevealed === null ||
    isHeroWeaponUsed === null ||
    result === null
  ) {
    return null
  }

  return {
    date,
    killer: record.killer,
    location: record.location,
    featureFilm,
    hero: record.hero,
    darkPower,
    finale,
    isHeroUltimateAbilityRevealed,
    isHeroWeaponUsed,
    signatureCard,
    result,
  }
}

async function handleApi(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean> {
  const url = new URL(request.url ?? '/', 'http://localhost')
  const pathname = url.pathname.replace(/\/$/, '') || '/'
  const entryMatch = pathname.match(/^\/api\/entries\/([^/]+)$/)

  if (entryMatch) {
    if (request.method !== 'DELETE') {
      response.setHeader('Allow', 'DELETE')
      sendJson(response, 405, { error: 'Method not allowed' })
      return true
    }

    let id: string
    try {
      id = decodeURIComponent(entryMatch[1] ?? '')
    } catch {
      sendJson(response, 400, { error: 'Invalid id' })
      return true
    }

    if (!(await removeEntry(id))) {
      sendJson(response, 404, { error: 'Entry not found' })
      return true
    }

    response.statusCode = 204
    response.end()
    return true
  }

  if (pathname !== entriesPath) return false

  if (request.method === 'GET') {
    sendJson(response, 200, await listEntries())
    return true
  }

  if (request.method === 'POST') {
    let payload: unknown
    try {
      payload = JSON.parse(await readBody(request))
    } catch {
      sendJson(response, 400, { error: 'Invalid JSON' })
      return true
    }

    const input = parseNewEntry(payload)
    if (!input) {
      sendJson(response, 400, {
        error: 'Choose a date, killer, location, and hero from the list',
      })
      return true
    }

    sendJson(response, 201, await addEntry(input))
    return true
  }

  response.setHeader('Allow', 'GET, POST')
  sendJson(response, 405, { error: 'Method not allowed' })
  return true
}

function apiMiddleware(): Connect.NextHandleFunction {
  return (request, response, next) => {
    void handleApi(request, response)
      .then((handled) => {
        if (!handled) next()
      })
      .catch((error: unknown) => {
        console.error(error)
        if (!response.headersSent) {
          sendJson(response, 500, { error: 'Could not handle the request' })
        }
      })
  }
}

export function entriesApiPlugin(): Plugin {
  const middleware = apiMiddleware()

  return {
    name: 'entries-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
