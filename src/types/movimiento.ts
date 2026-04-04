export type MovimientoTipo = 'ingreso' | 'egreso'

export interface MovimientoItem {
  id: number
  descripcion: string
  categoria: string
  fecha: string
  monto: number
  tipo: MovimientoTipo
}
