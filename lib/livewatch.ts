export const LIVEWATCH_BASE_URL = "https://livewatch.top"
export const LIVEWATCH_CACHE_SECONDS = 3600

export async function fetchLiveWatch<T>(
  path: string,
  params: Record<string, string | undefined> = {},
): Promise<T> {
  const url = new URL(path, LIVEWATCH_BASE_URL)

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value)
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    console.log(`Fetching LiveWatch: ${url.toString()}`)
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: LIVEWATCH_CACHE_SECONDS },
      signal: controller.signal,
    })

    if (!res.ok) {
      console.error(`LiveWatch API error: ${res.status} for ${url.toString()}`)
      throw new Error(`LiveWatch API error: ${res.status}`)
    }

    const data = await res.json()
    return data as T
  } catch (err) {
    console.error(`LiveWatch fetch error for ${url.toString()}:`, err)
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

export const TV_COUNTRIES = [
  "France",
  "Italy",
  "Spain",
  "Portugal",
  "Germany",
  "United Kingdom",
  "Belgium",
  "Netherlands",
  "Switzerland",
  "Albania",
  "Turkey",
  "Arabia",
  "Balkans",
  "Russia",
  "Romania",
  "Poland",
  "Bulgaria",
] as const
