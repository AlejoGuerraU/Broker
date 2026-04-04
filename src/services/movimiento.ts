import {
  mapCreateMovimientoPayload,
  mapMovimiento,
  type CreateMovimientoPayload,
  type MovimientoApiResponse,
} from '@/mappers/movimiento'
import type { MovimientoItem } from '@/types/movimiento'

let movimientosMock: MovimientoApiResponse[] = [
  {
    id: 1,
    description: 'Salario mensual',
    category_name: 'Salario',
    movement_date: '2026-02-28',
    amount: 4500,
    movement_type: 'income',
  },
  {
    id: 2,
    description: 'Alquiler',
    category_name: 'Vivienda',
    movement_date: '2026-02-28',
    amount: 1200,
    movement_type: 'expense',
  },
  {
    id: 3,
    description: 'Supermercado',
    category_name: 'Alimentacion',
    movement_date: '2026-03-04',
    amount: 320,
    movement_type: 'expense',
  },
  {
    id: 4,
    description: 'Freelance diseno web',
    category_name: 'Freelance',
    movement_date: '2026-03-07',
    amount: 850,
    movement_type: 'income',
  },
  {
    id: 5,
    description: 'Suscripcion Netflix',
    category_name: 'Entretenimiento',
    movement_date: '2026-03-09',
    amount: 15.99,
    movement_type: 'expense',
  },
  {
    id: 6,
    description: 'Electricidad',
    category_name: 'Servicios',
    movement_date: '2026-03-11',
    amount: 85,
    movement_type: 'expense',
  },
  {
    id: 7,
    description: 'Gasolina',
    category_name: 'Transporte',
    movement_date: '2026-03-13',
    amount: 60,
    movement_type: 'expense',
  },
  {
    id: 8,
    description: 'Dividendos AAPL',
    category_name: 'Inversiones',
    movement_date: '2026-03-14',
    amount: 125,
    movement_type: 'income',
  },
]

const simulateRequest = async <T,>(data: T): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), 150)
  })

export const getMovimientos = async (): Promise<MovimientoItem[]> => {
  const response = await simulateRequest(movimientosMock)
  return response.map(mapMovimiento)
}

export const createMovimiento = async (
  movimiento: CreateMovimientoPayload,
): Promise<MovimientoItem> => {
  const payload = mapCreateMovimientoPayload(movimiento)

  const nuevoMovimiento: MovimientoApiResponse = {
    id: Date.now(),
    description: payload.description,
    category_name: payload.category_name,
    movement_date: payload.movement_date,
    amount: payload.amount,
    movement_type: payload.movement_type,
  }

  movimientosMock = [nuevoMovimiento, ...movimientosMock]

  const response = await simulateRequest(nuevoMovimiento)
  return mapMovimiento(response)
}

export const updateMovimiento = async (
  id: number,
  movimiento: CreateMovimientoPayload,
): Promise<MovimientoItem> => {
  const payload = mapCreateMovimientoPayload(movimiento)

  const movimientoActualizado: MovimientoApiResponse = {
    id,
    description: payload.description,
    category_name: payload.category_name,
    movement_date: payload.movement_date,
    amount: payload.amount,
    movement_type: payload.movement_type,
  }

  movimientosMock = movimientosMock.map((item) => (item.id === id ? movimientoActualizado : item))

  const response = await simulateRequest(movimientoActualizado)
  return mapMovimiento(response)
}

export const deleteMovimiento = async (id: number): Promise<void> => {
  movimientosMock = movimientosMock.filter((item) => item.id !== id)
  await simulateRequest(undefined)
}
