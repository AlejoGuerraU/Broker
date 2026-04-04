import type {
  AccionPortafolioItem,
  OrdenHistorialEstado,
  OrdenHistorialItem,
  OrdenHistorialTipo,
} from '@/types/portafolio'

export interface PortfolioPositionApiResponse {
  id: number
  symbol: string
  company_name: string
  sector_name: string
  quantity: number
  average_price: number
  current_price: number
  daily_change_percent: number
}

export interface PortfolioOrderApiResponse {
  id: number
  created_at: string
  asset_symbol: string
  order_type: 'buy' | 'sell'
  quantity: number
  unit_price: number
  status: 'filled' | 'pending' | 'cancelled'
}

const mapOrderType = (orderType: PortfolioOrderApiResponse['order_type']): OrdenHistorialTipo =>
  orderType === 'buy' ? 'compra' : 'venta'

const mapOrderStatus = (status: PortfolioOrderApiResponse['status']): OrdenHistorialEstado => {
  switch (status) {
    case 'filled':
      return 'completada'
    case 'pending':
      return 'pendiente'
    case 'cancelled':
      return 'cancelada'
    default:
      return 'pendiente'
  }
}

export const mapPortfolioPosition = (
  position: PortfolioPositionApiResponse,
): AccionPortafolioItem => ({
  id: position.id,
  simbolo: position.symbol,
  nombre: position.company_name,
  sector: position.sector_name,
  cantidad: position.quantity,
  precioPromedio: position.average_price,
  precioActual: position.current_price,
  variacionDiaria: position.daily_change_percent,
})

export const mapPortfolioOrder = (
  order: PortfolioOrderApiResponse,
): OrdenHistorialItem => ({
  id: order.id,
  fecha: order.created_at,
  activo: order.asset_symbol,
  tipo: mapOrderType(order.order_type),
  cantidad: order.quantity,
  precio: order.unit_price,
  estado: mapOrderStatus(order.status),
})
