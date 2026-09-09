module.exports = {
  images: {
    domains: ['www.notion.so', 'lh5.googleusercontent.com', 's3-us-west-2.amazonaws.com', 'prod-files-secure.s3.us-west-2.amazonaws.com'],
    // Notion assets are proxied through /api/notion/image, which costs a Notion
    // API call plus an S3 download on a miss. Hold the optimized output for a
    // day so that only happens once per image.
    minimumCacheTTL: 86400,
  },
  experimental: {
    // Static generation forks one worker per CPU, each with its own module
    // state, so a per-process rate limiter is multiplied by the worker count
    // and Notion still returns 429. This build is bound by Notion's ~3
    // requests/second, not by CPU, so a single worker costs nothing and lets
    // the limiter in lib/notion-client/notionFetch.ts actually hold.
    cpus: 1,
  },
  // Pacing Notion requests caps a page at ~3 requests/second, and the biggest
  // posts walk well over a hundred blocks, so generating one can outlast the
  // 60s default and get its worker SIGTERMed mid-page.
  staticPageGenerationTimeout: 300,
}
