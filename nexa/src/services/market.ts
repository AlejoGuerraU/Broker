import type {
  AccionMercadoItem,
  CrearOrdenPayload,
  CrearOrdenRespuesta,
  DetalleActivoMercado,
  EstadoMercado,
} from '@/types/market'

interface MostActiveResponse {
  items?: AccionMercadoItem[]
  error?: string
}

interface BackendErrorResponse {
  error?: string
  message?: string
}

const normalizeBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) {
    return 'http://localhost:8080/api'
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

const marketApiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL)

const buildMarketUrl = (path: string) => `${marketApiBaseUrl}${path}`

const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

const parseBackendResponse = async <T>(response: Response): Promise<T | BackendErrorResponse> => {
  const text = await response.text()

  try {
    return text ? (JSON.parse(text) as T | BackendErrorResponse) : {}
  } catch {
    return {}
  }
}

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

export const createPortfolioOrder = async (
  payload: CrearOrdenPayload,
  token?: string,
): Promise<CrearOrdenRespuesta> => {
  const response = await fetch(buildMarketUrl('/portafolio/orders'), {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  })

  const data = await parseBackendResponse<CrearOrdenRespuesta>(response)

  if (!response.ok) {
    throw new Error(data.error ?? data.message ?? 'No se pudo crear la orden')
  }

  return data as CrearOrdenRespuesta
}

export const getMarketAssetDetail = async (
  simbolo: string,
): Promise<DetalleActivoMercado> => {
  const response = await fetch(buildMarketUrl(`/market/assets/${simbolo}`))

  const data = await parseBackendResponse<DetalleActivoMercado>(response)

  if (!response.ok) {
    throw new Error(data.error ?? data.message ?? 'No se pudo obtener el detalle del activo')
  }

  return data as DetalleActivoMercado
}

export const getMarketStatus = async (): Promise<EstadoMercado> => {
  const response = await fetch(buildMarketUrl('/market/status'))

  const data = await parseBackendResponse<EstadoMercado>(response)

  if (!response.ok) {
    throw new Error(data.error ?? data.message ?? 'No se pudo obtener el estado del mercado')
  }

  return data as EstadoMercado
}
