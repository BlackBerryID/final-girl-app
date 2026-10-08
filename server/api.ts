import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
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

function parseNewEntry(value: unknown): { title: string; note: string } | null {
  if (typeof value !== 'object' || value === null) return null

  const record = value as Record<string, unknown>
  if (typeof record.title !== 'string') return null

  const title = record.title.trim()
  if (title.length === 0 || title.length > 200) return null

  const noteValue = record.note === undefined ? '' : record.note
  if (typeof noteValue !== 'string') return null

  const note = noteValue.trim()
  if (note.length > 2000) return null

  return { title, note }
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
      sendJson(response, 400, { error: 'Некорректный JSON' })
      return true
    }

    const input = parseNewEntry(payload)
    if (!input) {
      sendJson(response, 400, {
        error: 'Укажите название до 200 символов и заметку до 2000 символов',
      })
      return true
    }

    sendJson(response, 201, await addEntry(input))
    return true
  }

  response.setHeader('Allow', 'GET, POST')
  sendJson(response, 405, { error: 'Метод не поддерживается' })
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
          sendJson(response, 500, { error: 'Не удалось обработать запрос' })
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
