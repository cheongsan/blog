module.exports = {
  images: {
    domains: ['www.notion.so', 'lh5.googleusercontent.com', 's3-us-west-2.amazonaws.com', 'prod-files-secure.s3.us-west-2.amazonaws.com'],
  },
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [{ source: '/py-api/:path*', destination: 'http://localhost:8000/py-api/:path*' }]
      : []
  },
}
