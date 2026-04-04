import React from 'react'
import TableShell from '@/components/organismos/tableShell'
import type { AccionPortafolioItem } from '@/types/portafolio'

interface TablePortfolioProps {
  acciones: AccionPortafolioItem[]
  onSelect: (accion: AccionPortafolioItem) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

const Index = ({ acciones, onSelect }: TablePortfolioProps) => {
  return (
    <TableShell
      title='Acciones adquiridas'
      description='Selecciona una posicion para ver su detalle en el portafolio.'
    >
      <table className='min-w-[760px] border-collapse'>
        <thead>
          <tr className='text-left text-[15px] text-[#8EA2BF]'>
            <th className='px-5 py-4 font-semibold'>Activo</th>
            <th className='px-5 py-4 font-semibold'>Sector</th>
            <th className='px-5 py-4 text-right font-semibold'>Cantidad</th>
            <th className='px-5 py-4 text-right font-semibold'>Precio actual</th>
            <th className='px-5 py-4 text-right font-semibold'>Var. diaria</th>
          </tr>
        </thead>

        <tbody>
          {acciones.length === 0 ? (
            <tr className='border-t border-[rgba(255,255,255,0.04)]'>
              <td colSpan={5} className='px-5 py-10 text-center text-sm text-[var(--bg-muted)]'>
                No hay acciones registradas todavia.
              </td>
            </tr>
          ) : null}

          {acciones.map((accion) => {
            const variacionClassName =
              accion.variacionDiaria >= 0 ? 'text-[#2FD67B]' : 'text-[#FF5A57]'

            return (
              <tr
                key={accion.id}
                className='cursor-pointer border-t border-[rgba(255,255,255,0.04)] text-[var(--bg-text)] transition-colors hover:bg-white/[0.02]'
                onClick={() => onSelect(accion)}
              >
                <td className='px-5 py-4'>
                  <div className='flex flex-col gap-1'>
                    <span className='text-[17px] font-semibold'>{accion.simbolo}</span>
                    <span className='text-sm text-[var(--bg-muted)]'>{accion.nombre}</span>
                  </div>
                </td>
                <td className='px-5 py-4'>
                  <span className='inline-flex rounded-full bg-[#202732] px-3 py-1 text-sm text-[var(--bg-text)]'>
                    {accion.sector}
                  </span>
                </td>
                <td className='px-5 py-4 text-right text-[17px] font-medium'>{accion.cantidad}</td>
                <td className='px-5 py-4 text-right text-[17px] font-medium'>
                  {formatCurrency(accion.precioActual)}
                </td>
                <td className={`px-5 py-4 text-right text-[17px] font-semibold ${variacionClassName}`}>
                  {formatPercent(accion.variacionDiaria)}
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
