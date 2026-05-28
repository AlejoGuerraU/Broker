import type { NextApiRequest, NextApiResponse } from 'next'

type CategoriaNoticia = 'Acciones' | 'Cripto' | 'Mundiales'

interface MarketAuxEntity {
  type?: string
}

interface MarketAuxArticle {
  uuid?: string
  title?: string
  description?: string
  snippet?: string
  url?: string
  image_url?: string
  published_at?: string
  entities?: MarketAuxEntity[]
}

interface MarketAuxResponse {
  data?: MarketAuxArticle[]
}

interface NoticiaResponseItem {
  id: string
  titulo: string
  descripcion: string
  categoria: CategoriaNoticia
  fecha: string
  imagen: string
  enlace: string
}

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="%2311161D"/><rect x="54" y="54" width="1092" height="567" rx="36" fill="%23171B21" stroke="%23202633"/><text x="84" y="184" fill="%238EE7B1" font-family="Arial, sans-serif" font-size="36" font-weight="700">Broker News</text><text x="84" y="252" fill="%23D9E2F2" font-family="Arial, sans-serif" font-size="58" font-weight="700">Actualidad del mercado</text><text x="84" y="330" fill="%238EA2BF" font-family="Arial, sans-serif" font-size="28">La noticia no incluye imagen disponible.</text></svg>'

const detectCategory = (article: MarketAuxArticle): CategoriaNoticia => {
  const text = [article.title, article.description, article.snippet].join(' ').toLowerCase()
  const entityTypes = (article.entities ?? []).map((entity) => entity.type?.toLowerCase() ?? '')

  const isCrypto =
    entityTypes.some((type) => ['cryptocurrency', 'crypto', 'token', 'blockchain'].includes(type)) ||
    /(bitcoin|ethereum|solana|xrp|altcoin|cripto|crypto|blockchain|token)/i.test(text)

  if (isCrypto) {
    return 'Cripto'
  }

  const isStocks =
    entityTypes.some((type) => ['equity', 'stock', 'company', 'etf', 'index'].includes(type)) ||
    /(acciones|accion|nasdaq|nyse|s&p|dow jones|wall street|earnings|equity|stock|bolsa)/i.test(text)

  if (isStocks) {
    return 'Acciones'
  }

  return 'Mundiales'
}

const normalizeArticle = (article: MarketAuxArticle, index: number): NoticiaResponseItem | null => {
  if (!article.title || !article.url) {
    return null
  }

  return {
    id: article.uuid ?? `${index}-${article.url}`,
    titulo: article.title.trim(),
    descripcion: (article.description || article.snippet || 'Sin descripcion disponible.').trim(),
    categoria: detectCategory(article),
    fecha: article.published_at ?? new Date().toISOString(),
    imagen: article.image_url || FALLBACK_IMAGE,
    enlace: article.url,
  }
}

// In-memory cache for news items
let cachedNoticias: NoticiaResponseItem[] | null = null
let cacheExpiry = 0
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  // Check if cache is still valid
  if (cachedNoticias && Date.now() < cacheExpiry) {
    return res.status(200).json({ data: cachedNoticias })
  }

  const apiKey = process.env.MARKETAUX_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'MARKETAUX_API_KEY no esta configurada.' })
  }

  try {
    // Free tier returns max 3 articles per request.
    // Fetch 6 pages to get 18 articles total.
    const pages = [1, 2, 3, 4, 5, 6]

    const fetchPage = async (page: number): Promise<MarketAuxArticle[]> => {
      const params = new URLSearchParams({
        countries: 'us',
        language: 'es',
        limit: '3',
        page: page.toString(),
        api_token: apiKey,
      })

      const response = await fetch(`https://api.marketaux.com/v1/news/all?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch page ${page}`)
      }
      const data = (await response.json()) as MarketAuxResponse
      return data.data ?? []
    }

    // Fetch all pages in parallel, catching errors per page to be robust
    const pageResults = await Promise.all(
      pages.map((page) =>
        fetchPage(page).catch((err) => {
          console.error(`Error fetching page ${page} from MarketAux:`, err)
          return [] as MarketAuxArticle[]
        })
      )
    )

    // Flatten all articles
    const allArticles = pageResults.flat()

    if (allArticles.length === 0 && cachedNoticias) {
      // If we got nothing but have cached news, return the cached news as a fallback
      return res.status(200).json({ data: cachedNoticias })
    }

    // Normalize and filter duplicates
    const normalized = allArticles
      .map(normalizeArticle)
      .filter((item): item is NoticiaResponseItem => item !== null)

    const uniqueNoticias: NoticiaResponseItem[] = []
    const seenIds = new Set<string>()

    for (const item of normalized) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id)
        uniqueNoticias.push(item)
      }
    }

    if (uniqueNoticias.length > 0) {
      cachedNoticias = uniqueNoticias
      cacheExpiry = Date.now() + CACHE_DURATION
    }

    return res.status(200).json({ data: uniqueNoticias })
  } catch (error) {
    console.error('Error fetching noticias:', error)
    if (cachedNoticias) {
      return res.status(200).json({ data: cachedNoticias })
    }
    return res.status(500).json({ error: 'Ocurrio un error al obtener las noticias.' })
  }
}
