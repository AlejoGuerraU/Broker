import {
  mapPortfolioOrder,
  mapPortfolioPosition,
  type PortfolioOrderApiResponse,
  type PortfolioPositionApiResponse,
} from '@/mappers/portafolio'
import type { AccionPortafolioItem, OrdenHistorialItem } from '@/types/portafolio'

const posicionesMock: PortfolioPositionApiResponse[] = [
  {
    id: 1,
    symbol: 'AAPL',
    company_name: 'Apple Inc.',
    sector_name: 'Tecnologia',
    quantity: 12,
    average_price: 182.35,
    current_price: 196.42,
    daily_change_percent: 1.26,
  },
  {
    id: 2,
    symbol: 'MSFT',
    company_name: 'Microsoft Corp.',
    sector_name: 'Tecnologia',
    quantity: 8,
    average_price: 401.2,
    current_price: 417.8,
    daily_change_percent: 0.84,
  },
  {
    id: 3,
    symbol: 'KO',
    company_name: 'Coca-Cola Co.',
    sector_name: 'Consumo',
    quantity: 20,
    average_price: 58.1,
    current_price: 56.92,
    daily_change_percent: -0.63,
  },
  {
    id: 4,
    symbol: 'JPM',
    company_name: 'JPMorgan Chase',
    sector_name: 'Financiero',
    quantity: 10,
    average_price: 191.7,
    current_price: 198.55,
    daily_change_percent: 0.47,
  },
]

const ordenesMock: PortfolioOrderApiResponse[] = [
  {
    id: 1,
    created_at: '2026-03-21',
    asset_symbol: 'AAPL',
    order_type: 'buy',
    quantity: 4,
    unit_price: 191.5,
    status: 'filled',
  },
  {
    id: 2,
    created_at: '2026-03-24',
    asset_symbol: 'MSFT',
    order_type: 'buy',
    quantity: 2,
    unit_price: 412.2,
    status: 'filled',
  },
  {
    id: 3,
    created_at: '2026-03-28',
    asset_symbol: 'KO',
    order_type: 'sell',
    quantity: 5,
    unit_price: 57.4,
    status: 'pending',
  },
  {
    id: 4,
    created_at: '2026-03-30',
    asset_symbol: 'JPM',
    order_type: 'buy',
    quantity: 3,
    unit_price: 197.1,
    status: 'cancelled',
  },
]

const simulateRequest = async <T,>(data: T): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(data), 150)
  })

export interface PortfolioData {
  acciones: AccionPortafolioItem[]
  ordenes: OrdenHistorialItem[]
}

export const getPortfolioData = async (): Promise<PortfolioData> => {
  const [accionesResponse, ordenesResponse] = await Promise.all([
    simulateRequest(posicionesMock),
    simulateRequest(ordenesMock),
  ])

  return {
    acciones: accionesResponse.map(mapPortfolioPosition),
    ordenes: ordenesResponse.map(mapPortfolioOrder),
  }
}
