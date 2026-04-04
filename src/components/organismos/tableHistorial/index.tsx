import React from 'react'
import TableShell from '@/components/organismos/tableShell'
import type { OrdenHistorialEstado, OrdenHistorialItem, OrdenHistorialTipo } from '@/types/portafolio'

interface TableHistorialProps {
  ordenes: OrdenHistorialItem[]
}

const formatFecha = (fecha: string) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${fecha}T00:00:00`))

const formatPrecio = (precio: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(precio)

const tipoClassNames: Record<OrdenHistorialTipo, string> = {
  compra: 'bg-[#173221] text-[#2FD67B]',
  venta: 'bg-[#351B1B] text-[#FF8A87]',
}

const estadoClassNames: Record<OrdenHistorialEstado, string> = {
  completada: 'bg-[#173221] text-[#2FD67B]',
  pendiente: 'bg-[#352B17] text-[#F4C96B]',
  cancelada: 'bg-[#351B1B] text-[#FF8A87]',
}

const Index = ({ ordenes }: TableHistorialProps) => {
  return (
    <TableShell
      title='Historial de ordenes'
      description='Consulta compras y ventas ejecutadas recientemente en tu portafolio.'
    >
      <table className='min-w-[860px] border-collapse'>
        <thead>
          <tr className='text-left text-[15px] text-[#8EA2BF]'>
            <th className='px-5 py-4 font-semibold'>Fecha</th>
            <th className='px-5 py-4 font-semibold'>Activo</th>
            <th className='px-5 py-4 font-semibold'>Tipo</th>
            <th className='px-5 py-4 text-right font-semibold'>Cantidad</th>
            <th className='px-5 py-4 text-right font-semibold'>Precio</th>
            <th className='px-5 py-4 font-semibold'>Estado</th>
          </tr>
        </thead>

        <tbody>
          {ordenes.length === 0 ? (
            <tr className='border-t border-[rgba(255,255,255,0.04)]'>
              <td colSpan={6} className='px-5 py-10 text-center text-sm text-[var(--bg-muted)]'>
                No hay ordenes registradas todavia.
              </td>
            </tr>
          ) : null}

          {ordenes.map((orden) => (
            <tr
              key={orden.id}
              className='border-t border-[rgba(255,255,255,0.04)] text-[var(--bg-text)] transition-colors hover:bg-white/[0.02]'
            >
              <td className='px-5 py-4 text-[17px] text-[#8EA2BF]'>{formatFecha(orden.fecha)}</td>
              <td className='px-5 py-4 text-[17px] font-semibold'>{orden.activo}</td>
              <td className='px-5 py-4'>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${tipoClassNames[orden.tipo]}`}>
                  {orden.tipo}
                </span>
              </td>
              <td className='px-5 py-4 text-right text-[17px] font-medium'>{orden.cantidad}</td>
              <td className='px-5 py-4 text-right text-[17px] font-medium'>{formatPrecio(orden.precio)}</td>
              <td className='px-5 py-4'>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${estadoClassNames[orden.estado]}`}>
                  {orden.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  )
}

export default Index
