import type { AccionMercadoItem } from '@/types/market'

interface MostActiveResponse {
  items?: AccionMercadoItem[]
  error?: string
}

const normalizeBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) {
    return '/api'
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

const marketApiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_MARKET_API_BASE_URL)

const buildMarketUrl = (path: string) => `${marketApiBaseUrl}${path}`

export const getMostActiveStocks = async (): Promise<AccionMercadoItem[]> => {
  const response = await fetch(buildMarketUrl('/market/most-active'))

  if (!response.ok) {
    throw new Error('No se pudo obtener el mercado')
  }

  const data = (await response.json()) as MostActiveResponse

  if (!data.items || data.items.length === 0) {
    throw new Error(data.error ?? 'No hay acciones disponibles')
  }

  return data.items
}
