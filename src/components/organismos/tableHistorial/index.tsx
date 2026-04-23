import React from 'react'
import Button from '@/components/atoms/button'
import TableShell from '@/components/organismos/tableShell'
import type { OrdenHistorialEstado, OrdenHistorialItem, OrdenHistorialTipo } from '@/types/portafolio'

interface TableHistorialProps {
  ordenes: OrdenHistorialItem[]
  pendingActionId?: number | null
  onSelect?: (orden: OrdenHistorialItem) => void
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
  rechazada: 'bg-[#2A1418] text-[#FFB3B3]',
}

const Index = ({ ordenes, pendingActionId = null, onSelect }: TableHistorialProps) => {
  return (
    <TableShell
      title='Historial de ordenes'
      description='Consulta compras y ventas de tu portafolio y administra las ordenes pendientes.'
    >
      <table className='min-w-[980px] border-collapse'>
        <thead>
          <tr className='text-left text-[15px] text-[#8EA2BF]'>
            <th className='px-5 py-4 font-semibold'>Fecha</th>
            <th className='px-5 py-4 font-semibold'>Activo</th>
            <th className='px-5 py-4 font-semibold'>Tipo</th>
            <th className='px-5 py-4 font-semibold'>Orden</th>
            <th className='px-5 py-4 text-right font-semibold'>Cantidad</th>
            <th className='px-5 py-4 text-right font-semibold'>Precio</th>
            <th className='px-5 py-4 font-semibold'>Estado</th>
            <th className='px-5 py-4 text-right font-semibold'>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ordenes.length === 0 ? (
            <tr className='border-t border-[rgba(255,255,255,0.04)]'>
              <td colSpan={8} className='px-5 py-10 text-center text-sm text-[var(--bg-muted)]'>
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
              <td className='px-5 py-4 text-[17px] capitalize text-[#8EA2BF]'>{orden.tipoOrden}</td>
              <td className='px-5 py-4 text-right text-[17px] font-medium'>{orden.cantidad}</td>
              <td className='px-5 py-4 text-right text-[17px] font-medium'>{formatPrecio(orden.precio)}</td>
              <td className='px-5 py-4'>
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize ${estadoClassNames[orden.estado]}`}>
                  {orden.estado}
                </span>
              </td>
              <td className='px-5 py-4'>
                <div className='flex justify-end gap-2'>
                  {orden.estado === 'pendiente' ? (
                    <Button
                      titulo={pendingActionId === orden.id ? 'Procesando...' : 'Gestionar'}
                      color='#1D2C24'
                      textColor='#B8F3CB'
                      className='px-3 py-2 text-sm'
                      onClick={() => onSelect?.(orden)}
                      disabled={pendingActionId === orden.id}
                    />
                  ) : (
                    <Button
                      titulo='Ver detalle'
                      color='#171B21'
                      textColor='#E6EBF0'
                      className='px-3 py-2 text-sm'
                      onClick={() => onSelect?.(orden)}
                    />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  )
}

export default Index
