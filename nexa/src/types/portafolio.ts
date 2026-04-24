export interface AccionPortafolioItem {
  id: number
  simbolo: string
  nombre: string
  sector: string
  cantidad: number
  precioPromedio: number
  precioActual: number
  variacionDiaria: number
}

export type OrdenHistorialTipo = 'compra' | 'venta'

export type OrdenHistorialTipoOrden = 'mercado' | 'limite'

export type OrdenHistorialEstado = 'completada' | 'pendiente' | 'cancelada' | 'rechazada'

export interface OrdenHistorialItem {
  id: number
  fecha: string
  activo: string
  tipo: OrdenHistorialTipo
  tipoOrden: OrdenHistorialTipoOrden
  cantidad: number
  precio: number
  estado: OrdenHistorialEstado
}

export interface ResumenCuentaBroker {
  saldoDisponible: number
  saldoCongelado: number
}
