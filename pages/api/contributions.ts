import type { NextApiRequest, NextApiResponse } from "next"

const GITHUB_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]

function combinedColor(count: number): string {
  if (count <= 0) return GITHUB_COLORS[0]
  if (count <= 2) return GITHUB_COLORS[1]
  if (count <= 5) return GITHUB_COLORS[2]
  if (count <= 9) return GITHUB_COLORS[3]
  return GITHUB_COLORS[4]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const github = (req.query.github as string) || ""
  const gitlab = (req.query.gitlab as string) || ""
  const merged: Record<string, any> = {}

  if (github) {
    try {
      const ghRes = await fetch(`https://github.com/users/${github}/contributions`)
      if (ghRes.ok) {
        const html = await ghRes.text()
        const re = /data-ix="(\d+)"[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="contribution-day-component-\d+-\d+"[^>]*data-level="(\d)"/g
        let m
        while ((m = re.exec(html))) {
          merged[m[2]] = { date: m[2], count: parseInt(m[3]), weekIndex: parseInt(m[1]) }
        }
      }
    } catch {}
  }

  if (gitlab) {
    try {
      const glRes = await fetch(`https://gitlab.com/users/${gitlab}/calendar.json`)
      if (glRes.ok) {
        const data = await glRes.json()
        for (const [date, count] of Object.entries(data) as [string, number][]) {
          if (merged[date]) merged[date].count += count
          else merged[date] = { date, count, weekIndex: null }
        }
      }
    } catch {}
  }

  const result = Object.values(merged).map((v: any) => ({
    ...v,
    color: combinedColor(v.count),
  }))

  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
  res.json(result)
}
