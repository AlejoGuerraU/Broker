import React, { useMemo, useState } from 'react'
import Icon from '@/components/atoms/icon'
import TableShell from '@/components/organismos/tableShell'
import type { MovimientoItem, MovimientoTipo } from '@/types/movimiento'

type FiltroMovimiento = 'todos' | MovimientoTipo

interface TableMoneyProps {
  movimientos: MovimientoItem[]
  onEdit: (movimiento: MovimientoItem) => void
  onDelete: (movimiento: MovimientoItem) => void
}

const filtros: Array<{ id: FiltroMovimiento; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'ingreso', label: 'Ingresos' },
  { id: 'egreso', label: 'Gastos' },
]

const formatFecha = (fecha: string) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${fecha}T00:00:00`))

const formatMonto = (monto: number, tipo: MovimientoTipo) => {
  const sign = tipo === 'ingreso' ? '+' : '-'
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(monto)

  return `${sign}${formatted}`
}

const Index = ({ movimientos, onEdit, onDelete }: TableMoneyProps) => {
  const [filtroActivo, setFiltroActivo] = useState<FiltroMovimiento>('todos')

  const movimientosFiltrados = useMemo(() => {
    if (filtroActivo === 'todos') {
      return movimientos
    }

    return movimientos.filter((movimiento) => movimiento.tipo === filtroActivo)
  }, [filtroActivo, movimientos])

  return (
    <TableShell
      title='Transacciones'
      description='Desglose reciente de ingresos y egresos.'
      actions={filtros.map((filtro) => {
        const isActive = filtroActivo === filtro.id

        return (
          <button
            key={filtro.id}
            type='button'
            onClick={() => setFiltroActivo(filtro.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border border-[#25B161] bg-[#25B161] text-white'
                : 'border border-transparent bg-[#1E242D] text-[var(--bg-text)] hover:border-[var(--bg-border)] hover:bg-[#242B35]'
            }`}
          >
            {filtro.label}
          </button>
        )
      })}
    >
        <table className='min-w-[760px] border-collapse'>
          <thead>
            <tr className='text-left text-[15px] text-[#8EA2BF]'>
              <th className='px-5 py-4 font-semibold'>Descripcion</th>
              <th className='px-5 py-4 font-semibold'>Categoria</th>
              <th className='px-5 py-4 font-semibold'>Fecha</th>
              <th className='px-5 py-4 text-right font-semibold'>Monto</th>
              <th className='px-5 py-4 text-right font-semibold'>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {movimientosFiltrados.length === 0 ? (
              <tr className='border-t border-[rgba(255,255,255,0.04)]'>
                <td colSpan={5} className='px-5 py-10 text-center text-sm text-[var(--bg-muted)]'>
                  No hay movimientos para este filtro todavia.
                </td>
              </tr>
            ) : null}

            {movimientosFiltrados.map((movimiento) => {
              const amountClassName =
                movimiento.tipo === 'ingreso' ? 'text-[#2FD67B]' : 'text-[#FF5A57]'

              return (
                <tr
                  key={movimiento.id}
                  className='border-t border-[rgba(255,255,255,0.04)] text-[var(--bg-text)] transition-colors hover:bg-white/[0.02]'
                >
                  <td className='px-5 py-4 text-[17px] font-medium'>{movimiento.descripcion}</td>
                  <td className='px-5 py-4'>
                    <span className='inline-flex rounded-full bg-[#202732] px-3 py-1 text-sm text-[var(--bg-text)]'>
                      {movimiento.categoria}
                    </span>
                  </td>
                  <td className='px-5 py-4 text-[17px] text-[#8EA2BF]'>{formatFecha(movimiento.fecha)}</td>
                  <td className={`px-5 py-4 text-right text-[17px] font-semibold ${amountClassName}`}>
                    {formatMonto(movimiento.monto, movimiento.tipo)}
                  </td>
                  <td className='px-5 py-4'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        type='button'
                        onClick={() => onEdit(movimiento)}
                        className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2D3744] bg-[#1B212A] text-[#8EA2BF] transition-colors hover:border-[#25B161] hover:text-[#25B161]'
                        aria-label={`Editar movimiento ${movimiento.descripcion}`}
                      >
                        <Icon name='solar:pen-2-linear' width={18} height={18} />
                      </button>
                      <button
                        type='button'
                        onClick={() => onDelete(movimiento)}
                        className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#3A2528] bg-[#25171A] text-[#FF8B88] transition-colors hover:border-[#FF5A57] hover:text-[#FF5A57]'
                        aria-label={`Eliminar movimiento ${movimiento.descripcion}`}
                      >
                        <Icon name='solar:trash-bin-trash-linear' width={18} height={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
    </TableShell>
  )
}

export default Index
