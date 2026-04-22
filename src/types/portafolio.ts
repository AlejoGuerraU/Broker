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

export type OrdenHistorialEstado = 'completada' | 'pendiente' | 'cancelada'

export interface OrdenHistorialItem {
  id: number
  fecha: string
  activo: string
  tipo: OrdenHistorialTipo
  cantidad: number
  precio: number
  estado: OrdenHistorialEstado
}

export interface ResumenCuentaBroker {
  saldoDisponible: number
  saldoCongelado: number
}
