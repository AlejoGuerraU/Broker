import type { MovimientoItem, MovimientoTipo } from '@/types/movimiento'

export interface MovimientoApiResponse {
  id: number
  description: string
  category_name: string
  movement_date: string
  amount: number
  movement_type: 'income' | 'expense'
}

export interface CreateMovimientoPayload {
  descripcion: string
  categoria: string
  fecha: string
  monto: number
  tipo: MovimientoTipo
}

export interface CreateMovimientoApiPayload {
  description: string
  category_name: string
  movement_date: string
  amount: number
  movement_type: 'income' | 'expense'
}

const mapMovimientoTipo = (movementType: MovimientoApiResponse['movement_type']): MovimientoTipo =>
  movementType === 'income' ? 'ingreso' : 'egreso'

const mapApiMovimientoTipo = (tipo: MovimientoTipo): CreateMovimientoApiPayload['movement_type'] =>
  tipo === 'ingreso' ? 'income' : 'expense'

export const mapMovimiento = (movimiento: MovimientoApiResponse): MovimientoItem => ({
  id: movimiento.id,
  descripcion: movimiento.description,
  categoria: movimiento.category_name,
  fecha: movimiento.movement_date,
  monto: movimiento.amount,
  tipo: mapMovimientoTipo(movimiento.movement_type),
})

export const mapCreateMovimientoPayload = (
  movimiento: CreateMovimientoPayload,
): CreateMovimientoApiPayload => ({
  description: movimiento.descripcion,
  category_name: movimiento.categoria,
  movement_date: movimiento.fecha,
  amount: movimiento.monto,
  movement_type: mapApiMovimientoTipo(movimiento.tipo),
})
