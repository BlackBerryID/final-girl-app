import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import {
  FEATURE_FILM_OPTIONS,
  KILLERS,
  LOCATIONS,
} from '../src/data/featureFilms.ts'
import { addEntry, listEntries } from './db.ts'

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

function parseNewEntry(value: unknown): {
  killer: string
  location: string
  featureFilm: string
} | null {
  if (typeof value !== 'object' || value === null) return null

  const record = value as Record<string, unknown>
  if (!isListed(record.killer, KILLERS)) return null
  if (!isListed(record.location, LOCATIONS)) return null
  if (!isListed(record.featureFilm, FEATURE_FILM_OPTIONS)) return null

  return {
    killer: record.killer,
    location: record.location,
    featureFilm: record.featureFilm,
  }
}

async function handleApi(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean> {
  const url = new URL(request.url ?? '/', 'http://localhost')
  const pathname = url.pathname.replace(/\/$/, '') || '/'
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
        error: 'Choose a killer, location, and feature film from the list',
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
