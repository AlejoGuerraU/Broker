export interface AccionMercadoItem {
  id: number
  nombre: string
  simbolo: string
  precio: string
  variacion: number
  volumen?: string
  logoTexto: string
  logoClase: string
}

export type TipoOperacionBroker = 'compra' | 'venta'

export interface CrearOrdenPayload {
  simbolo: string
  tipoOperacion: TipoOperacionBroker
  cantidad: number
  tipoOrden?: 'mercado' | 'limite'
  precioLimite?: number
}

export interface CrearOrdenRespuesta {
  id: number
  simbolo: string
  tipoOperacion: string
  tipoOrden: string
  estado: string
  cantidad: number
  precioReferencia: number
  precioEjecucion: number | null
  valorTotal: number | null
  saldoDisponible: number
  saldoCongelado: number
  mensaje: string
}

export interface DetalleActivoMercado {
  id: number
  nombre: string
  simbolo: string
  precioActual: number
  variacionDiaria: number
  volumen: string
  mercado: string
  moneda: string
}

export interface EstadoMercado {
  fuente: string
  apiKeyConfigurada: boolean
  alphaVantageDisponible: boolean
  mercadoAbierto: boolean
  zonaHorariaMercado: string
  activosPersistidos: number
  mensaje: string
}
