const MAX_ATTEMPTS = 5
const MAX_BACKOFF_MS = 15_000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Notion allows roughly 3 requests/second per integration. A build walks every
// block of every post and generates pages concurrently, so left alone it bursts
// far past that and then spends the rest of the build backing off — or gives up
// and 404s the biggest posts. Spacing request starts is cheaper than retrying:
// it keeps us under the limit instead of discovering it.
const MIN_REQUEST_INTERVAL_MS = 400

let gate: Promise<unknown> = Promise.resolve()
let lastStartedAt = 0

/** Resolves when it is this caller's turn to issue a request. */
function takeSlot(): Promise<void> {
  const slot = gate.then(async () => {
    const wait = lastStartedAt + MIN_REQUEST_INTERVAL_MS - Date.now()
    if (wait > 0) await sleep(wait)
    lastStartedAt = Date.now()
  })
  // Keep the chain alive even if this caller's request later rejects.
  gate = slot.catch(() => {})
  return slot
}

/** Notion's documented limit averages ~3 requests/second, and a build walks
 *  every block of every post, so bursts past it are routine rather than
 *  exceptional. Only 429 and 5xx are retried — a 403/404 is a standing fact
 *  about the content and retrying it just slows the build down. */
const isRetryable = (status: number) => status === 429 || status >= 500

/** Notion sends Retry-After on 429; honour it, since guessing shorter just
 *  earns another 429. */
function backoffMs(res: Response, attempt: number) {
  const header = Number(res.headers.get("retry-after"))
  if (Number.isFinite(header) && header > 0) {
    return Math.min(header * 1000, MAX_BACKOFF_MS)
  }
  return Math.min(2 ** attempt * 500, MAX_BACKOFF_MS)
}

/**
 * fetch() against the Notion API with retry on rate limits.
 *
 * Returns the response for any status it won't retry, so callers keep deciding
 * what a 404 means. Throws only when retries are exhausted — that signals "we
 * never got an answer", which callers must not mistake for "there is nothing
 * here". Uses no Node built-ins, so it is safe on the edge runtime too.
 */
export async function notionFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  let lastStatus = 0

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res: Response
    try {
      // Retries are requests too, so they queue for a slot like anything else.
      await takeSlot()
      res = await fetch(url, init)
    } catch (e) {
      // Network-level failure; retry it the same way as a 5xx.
      if (attempt === MAX_ATTEMPTS) throw e
      await sleep(Math.min(2 ** attempt * 500, MAX_BACKOFF_MS))
      continue
    }

    if (res.ok || !isRetryable(res.status)) return res

    lastStatus = res.status
    if (attempt === MAX_ATTEMPTS) break

    const wait = backoffMs(res, attempt)
    console.warn(
      `Notion API ${res.status} on ${new URL(url).pathname} — retrying in ${wait}ms (attempt ${attempt}/${MAX_ATTEMPTS})`
    )
    await sleep(wait)
  }

  throw new Error(
    `Notion API error: ${lastStatus} after ${MAX_ATTEMPTS} attempts`
  )
}
