import {
  mapCreateMovimientoPayload,
  mapMovimiento,
  type CreateMovimientoPayload,
} from '@/mappers/movimiento'
import type { MovimientoItem } from '@/types/movimiento'

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

export const getMovimientos = async (token?: string): Promise<MovimientoItem[]> => {
  const response = await fetch(buildBackendUrl('/movimientos'), {
    headers: getAuthHeaders(token),
  })

  if (!response.ok) {
    throw new Error('No se pudieron obtener los movimientos')
  }

  const data = await response.json()
  return data.map(mapMovimiento)
}

export const createMovimiento = async (
  movimiento: CreateMovimientoPayload,
  token?: string,
): Promise<MovimientoItem> => {
  const payload = mapCreateMovimientoPayload(movimiento)
  const response = await fetch(buildBackendUrl('/movimientos'), {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('No se pudo crear el movimiento')
  }

  const data = await response.json()
  return mapMovimiento(data)
}

export const updateMovimiento = async (
  id: number,
  movimiento: CreateMovimientoPayload,
  token?: string,
): Promise<MovimientoItem> => {
  const payload = mapCreateMovimientoPayload(movimiento)
  const response = await fetch(buildBackendUrl(`/movimientos/${id}`), {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('No se pudo actualizar el movimiento')
  }

  const data = await response.json()
  return mapMovimiento(data)
}

export const deleteMovimiento = async (id: number, token?: string): Promise<void> => {
  const response = await fetch(buildBackendUrl(`/movimientos/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  })

  if (!response.ok) {
    throw new Error('No se pudo eliminar el movimiento')
  }
}
