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
export type TipoOrdenBroker = 'mercado' | 'limite' | 'stop'

export interface CrearOrdenPayload {
  simbolo: string
  tipoOperacion: TipoOperacionBroker
  cantidad: number
  tipoOrden?: TipoOrdenBroker
  precioLimite?: number
}

export interface ActualizarOrdenPayload {
  cantidad: number
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

export interface PuntoHistorialActivoMercado {
  fecha: string
  apertura: number
  maximo: number
  minimo: number
  cierre: number
}

export interface HistorialActivoMercado {
  activoId: number
  simbolo: string
  moneda: string
  puntos: PuntoHistorialActivoMercado[]
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

export interface AnalisisFundamentalMercado {
  simbolo: string
  nombreEmpresa: string
  descripcion: string | null
  mercado: string | null
  moneda: string | null
  pais: string | null
  sector: string | null
  industria: string | null
  capitalizacionMercado: number | null
  ebitda: number | null
  perRatio: number | null
  forwardPer: number | null
  pegRatio: number | null
  priceToSalesRatioTtm: number | null
  priceToBookRatio: number | null
  evToRevenue: number | null
  evToEbitda: number | null
  bookValue: number | null
  dividendPerShare: number | null
  dividendYield: number | null
  eps: number | null
  revenuePerShareTtm: number | null
  profitMargin: number | null
  operatingMarginTtm: number | null
  returnOnAssetsTtm: number | null
  returnOnEquityTtm: number | null
  revenueTtm: number | null
  grossProfitTtm: number | null
  dilutedEpsTtm: number | null
  quarterlyEarningsGrowthYoy: number | null
  quarterlyRevenueGrowthYoy: number | null
  analystTargetPrice: number | null
  beta: number | null
  week52High: number | null
  week52Low: number | null
  movingAverage50Day: number | null
  movingAverage200Day: number | null
  sharesOutstanding: number | null
  dividendDate: string | null
  exDividendDate: string | null
  fechaActualizacion: string
}
