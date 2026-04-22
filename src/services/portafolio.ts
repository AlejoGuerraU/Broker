import {
  mapPortfolioOrder,
  mapPortfolioPosition,
} from '@/mappers/portafolio'
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
    },
  }
}
