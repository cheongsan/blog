module.exports = {
  images: {
    domains: ['www.notion.so', 'lh5.googleusercontent.com', 's3-us-west-2.amazonaws.com', 'prod-files-secure.s3.us-west-2.amazonaws.com'],
    // Notion assets are proxied through /api/notion/image, which costs a Notion
    // API call plus an S3 download on a miss. Hold the optimized output for a
    // day so that only happens once per image.
    minimumCacheTTL: 86400,
  },
}
