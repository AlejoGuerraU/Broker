import {
  mapPortfolioOrder,
  mapPortfolioPosition,
} from '@/mappers/portafolio'
import type { ActualizarOrdenPayload, CrearOrdenRespuesta } from '@/types/market'
import type {
  AccionPortafolioItem,
  OrdenHistorialItem,
  ResumenCuentaBroker,
} from '@/types/portafolio'

const normalizeBaseUrl = (baseUrl?: string) => {
  if (!baseUrl) {
    return 'http://localhost:8080/api'
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

const backendApiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL)

const buildBackendUrl = (path: string) => `${backendApiBaseUrl}${path}`

const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export interface PortfolioData {
  acciones: AccionPortafolioItem[]
  ordenes: OrdenHistorialItem[]
  resumenCuenta: ResumenCuentaBroker
}

export interface ResetDemoPortfolioResponse {
  available_cash: number
  frozen_cash: number
  last_reset_at: string | null
  deleted_orders: number
  message: string
}

export const getPortfolioData = async (token?: string): Promise<PortfolioData> => {
  const headers = getAuthHeaders(token)

  const [accionesResponse, ordenesResponse, resumenResponse] = await Promise.all([
    fetch(buildBackendUrl('/portafolio/positions'), { headers }),
    fetch(buildBackendUrl('/portafolio/orders'), { headers }),
    fetch(buildBackendUrl('/portafolio/summary'), { headers }),
  ])

  if (!accionesResponse.ok || !ordenesResponse.ok || !resumenResponse.ok) {
    throw new Error('No se pudo obtener el portafolio')
  }

  const accionesData = await accionesResponse.json()
  const ordenesData = await ordenesResponse.json()
  const resumenData = await resumenResponse.json()

  return {
    acciones: accionesData.map(mapPortfolioPosition),
    ordenes: ordenesData.map(mapPortfolioOrder),
    resumenCuenta: {
      saldoDisponible: resumenData.available_cash ?? 0,
      saldoCongelado: resumenData.frozen_cash ?? 0,
      fechaUltimoReinicio: resumenData.last_reset_at ?? null,
    },
  }
}

const parseBackendResponse = async (response: Response) => {
  const text = await response.text()

  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return {}
  }
}

export const updatePortfolioOrder = async (
  orderId: number,
  payload: ActualizarOrdenPayload,
  token?: string,
): Promise<CrearOrdenRespuesta> => {
  const response = await fetch(buildBackendUrl(`/portafolio/orders/${orderId}`), {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  })

  const data = await parseBackendResponse(response)

  if (!response.ok) {
    throw new Error(data.error ?? data.message ?? 'No se pudo modificar la orden')
  }

  return data as CrearOrdenRespuesta
}

export const cancelPortfolioOrder = async (
  orderId: number,
  token?: string,
): Promise<CrearOrdenRespuesta> => {
  const response = await fetch(buildBackendUrl(`/portafolio/orders/${orderId}`), {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  })

  const data = await parseBackendResponse(response)

  if (!response.ok) {
    throw new Error(data.error ?? data.message ?? 'No se pudo cancelar la orden')
  }

  return data as CrearOrdenRespuesta
}

export const resetDemoPortfolio = async (token?: string): Promise<ResetDemoPortfolioResponse> => {
  const response = await fetch(buildBackendUrl('/portafolio/reset'), {
    method: 'POST',
    headers: getAuthHeaders(token),
  })

  const data = await parseBackendResponse(response)

  if (!response.ok) {
    throw new Error(data.error ?? data.message ?? 'No se pudo reiniciar la demo')
  }

  return data as ResetDemoPortfolioResponse
}
