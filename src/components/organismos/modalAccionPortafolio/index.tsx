import React from 'react'
import Button from '@/components/atoms/button'
import Icon from '@/components/atoms/icon'
import type { AccionPortafolioItem } from '@/types/portafolio'

interface ModalAccionPortafolioProps {
  isOpen: boolean
  accion: AccionPortafolioItem | null
  onClose: () => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

const Index = ({ isOpen, accion, onClose }: ModalAccionPortafolioProps) => {
  if (!isOpen || !accion) {
    return null
  }

  const inversionTotal = accion.cantidad * accion.precioPromedio
  const valorActual = accion.cantidad * accion.precioActual
  const ganancia = valorActual - inversionTotal
  const gananciaPorcentual = inversionTotal === 0 ? 0 : (ganancia / inversionTotal) * 100
  const variationClassName = accion.variacionDiaria >= 0 ? 'text-[#2FD67B]' : 'text-[#FF5A57]'
  const gainClassName = ganancia >= 0 ? 'text-[#2FD67B]' : 'text-[#FF5A57]'

  return (
    <div className='fixed inset-0 z-50 bg-black/55 px-3 py-3 sm:px-4 sm:py-4'>
      <div className='flex min-h-full items-start justify-center sm:items-center'>
        <div className='max-h-[calc(100vh-1.5rem)] w-full max-w-[520px] overflow-y-auto rounded-[20px] border border-[var(--bg-border)] bg-[var(--card-color)] p-4 sm:max-h-[calc(100vh-2rem)] sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]'>
          <div className='mb-5 flex items-start justify-between gap-3'>
            <div>
              <h2 className='text-[20px] font-semibold leading-none text-[var(--bg-text)]'>{accion.simbolo}</h2>
              <p className='mt-2 text-sm text-[var(--bg-muted)]'>{accion.nombre}</p>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='text-[var(--bg-muted)] transition-colors hover:text-[var(--bg-text)]'
              aria-label='Cerrar modal'
            >
              <Icon name='mdi:close' width={20} height={20} />
            </button>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <article className='rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
              <p className='text-sm text-[var(--bg-muted)]'>Sector</p>
              <p className='mt-2 text-lg font-semibold text-[var(--bg-text)]'>{accion.sector}</p>
            </article>
            <article className='rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
              <p className='text-sm text-[var(--bg-muted)]'>Cantidad</p>
              <p className='mt-2 text-lg font-semibold text-[var(--bg-text)]'>{accion.cantidad} acciones</p>
            </article>
            <article className='rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
              <p className='text-sm text-[var(--bg-muted)]'>Precio promedio</p>
              <p className='mt-2 text-lg font-semibold text-[var(--bg-text)]'>{formatCurrency(accion.precioPromedio)}</p>
            </article>
            <article className='rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
              <p className='text-sm text-[var(--bg-muted)]'>Precio actual</p>
              <p className='mt-2 text-lg font-semibold text-[var(--bg-text)]'>{formatCurrency(accion.precioActual)}</p>
            </article>
            <article className='rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
              <p className='text-sm text-[var(--bg-muted)]'>Variacion diaria</p>
              <p className={`mt-2 text-lg font-semibold ${variationClassName}`}>
                {formatPercent(accion.variacionDiaria)}
              </p>
            </article>
            <article className='rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
              <p className='text-sm text-[var(--bg-muted)]'>Rentabilidad</p>
              <p className={`mt-2 text-lg font-semibold ${gainClassName}`}>
                {formatCurrency(ganancia)} ({formatPercent(gananciaPorcentual)})
              </p>
            </article>
          </div>

          <div className='mt-4 rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
            <div className='flex items-center justify-between gap-3 text-sm text-[var(--bg-muted)]'>
              <span>Inversion total</span>
              <span className='font-medium text-[var(--bg-text)]'>{formatCurrency(inversionTotal)}</span>
            </div>
            <div className='mt-3 flex items-center justify-between gap-3 text-sm text-[var(--bg-muted)]'>
              <span>Valor actual</span>
              <span className='font-medium text-[var(--bg-text)]'>{formatCurrency(valorActual)}</span>
            </div>
          </div>

          <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Button
              titulo='Vender'
              color='#C24141'
              className='h-11 rounded-xl text-base text-white'
            />
            <Button
              titulo='Comprar'
              color='#25B161'
              className='h-11 rounded-xl text-base text-white'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
