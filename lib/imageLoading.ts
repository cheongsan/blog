import { useEffect, useRef, useSyncExternalStore } from "react"

let pending = 0
const listeners = new Set<() => void>()

const notify = () => listeners.forEach((listener) => listener())

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Whether the browser is currently fetching any image on the page. Lets the
 * header logo keep its shimmer running while the page fills in, without the
 * images and the logo needing to know about each other.
 */
export function useImagesLoading(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => pending > 0,
    () => false // Nothing is fetching during SSR.
  )
}

/**
 * The browser leaves currentSrc empty until it actually begins fetching, which
 * is the difference between "loading" and "lazy, far down the page, not
 * started". Counting the latter would pin the shimmer on until someone
 * scrolled. Judging it by geometry instead only approximates this — a lazy
 * image can sit just below the fold with the fetch not yet begun — so read the
 * real signal.
 */
const hasStartedFetching = (image: HTMLImageElement) => image.currentSrc !== ""

// There is no event for "started fetching", so the few images still waiting are
// polled. One shared timer, and only while something is actually waiting.
const POLL_INTERVAL_MS = 250
const waiting = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null

function stopPolling() {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

function waitForFetchStart(check: () => void) {
  waiting.add(check)
  if (!timer) {
    timer = setInterval(() => {
      waiting.forEach((pendingCheck) => pendingCheck())
      if (waiting.size === 0) stopPolling()
    }, POLL_INTERVAL_MS)
  }
  return () => {
    waiting.delete(check)
    if (waiting.size === 0) stopPolling()
  }
}

/** Attach to an <img> to report it while the browser is fetching it. */
export function useImageLoadingBeacon(loading: boolean) {
  const ref = useRef<HTMLImageElement | null>(null)
  const counted = useRef(false)

  useEffect(() => {
    const release = () => {
      if (!counted.current) return
      counted.current = false
      pending = Math.max(0, pending - 1)
      notify()
    }

    const count = () => {
      if (counted.current) return
      counted.current = true
      pending += 1
      notify()
    }

    if (!loading) {
      release()
      return
    }

    const element = ref.current
    if (!element) {
      // No element to inspect — assume it is fetching, so the signal errs
      // toward "still loading" rather than never firing at all.
      count()
      return release
    }

    let stopWaiting = () => {}
    const check = () => {
      if (!hasStartedFetching(element)) return
      count()
      stopWaiting()
    }

    stopWaiting = waitForFetchStart(check)
    check()

    return () => {
      stopWaiting()
      release()
    }
  }, [loading])

  return ref
}
