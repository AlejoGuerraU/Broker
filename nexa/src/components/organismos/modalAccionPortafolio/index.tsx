import React, { useEffect, useState } from 'react'
import Button from '@/components/atoms/button'
import Icon from '@/components/atoms/icon'
import Input from '@/components/atoms/input'
import Select from '@/components/atoms/select'
import { createPortfolioOrder } from '@/services/market'
import type { TipoOperacionBroker, TipoOrdenBroker } from '@/types/market'
import type { AccionPortafolioItem } from '@/types/portafolio'

interface ModalAccionPortafolioProps {
  isOpen: boolean
  accion: AccionPortafolioItem | null
  token?: string
  onClose: () => void
  onOrderSuccess?: () => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

const Index = ({ isOpen, accion, token, onClose, onOrderSuccess }: ModalAccionPortafolioProps) => {
  const [cantidad, setCantidad] = useState('')
  const [tipoOrden, setTipoOrden] = useState<TipoOrdenBroker>('mercado')
  const [precioCondicion, setPrecioCondicion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderMessage, setOrderMessage] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setCantidad('')
      setTipoOrden('mercado')
      setPrecioCondicion('')
      setOrderMessage(null)
      setOrderError(null)
    }
  }, [isOpen, accion?.simbolo])

  if (!isOpen || !accion) {
    return null
  }

  const normalizedCantidadOperacion = Number(cantidad)
  const normalizedPrecioCondicion = Number(precioCondicion)
  const requiresTriggerPrice = tipoOrden === 'limite' || tipoOrden === 'stop'

  // Backend valida/scalea, pero aquí mostramos un estimado para UX.
  const precioReferenciaOperacion = requiresTriggerPrice ? normalizedPrecioCondicion : accion.precioActual
  const hasCantidadOperacion = Number.isFinite(normalizedCantidadOperacion) && normalizedCantidadOperacion > 0
  const hasPrecioReferenciaOperacion =
    Number.isFinite(precioReferenciaOperacion) && precioReferenciaOperacion > 0

  const costoOperacion = hasCantidadOperacion && hasPrecioReferenciaOperacion ? normalizedCantidadOperacion * precioReferenciaOperacion : 0
  const valorActualOperacion = hasCantidadOperacion ? normalizedCantidadOperacion * accion.precioActual : 0

  const inversionTotal = accion.cantidad * accion.precioPromedio
  const valorActual = accion.cantidad * accion.precioActual
  const ganancia = valorActual - inversionTotal
  const gananciaPorcentual = inversionTotal === 0 ? 0 : (ganancia / inversionTotal) * 100
  const variationClassName = accion.variacionDiaria >= 0 ? 'text-[#2FD67B]' : 'text-[#FF5A57]'
  const gainClassName = ganancia >= 0 ? 'text-[#2FD67B]' : 'text-[#FF5A57]'

  const handleOrder = async (tipoOperacion: TipoOperacionBroker) => {
    const normalizedCantidad = Number(cantidad)
    const requiresTriggerPrice = tipoOrden === 'limite' || tipoOrden === 'stop'
    const normalizedPrecioCondicion = Number(precioCondicion)

    if (!Number.isFinite(normalizedCantidad) || normalizedCantidad <= 0) {
      setOrderError('Ingresa una cantidad valida mayor a cero.')
      setOrderMessage(null)
      return
    }

    if (
      requiresTriggerPrice
      && (!Number.isFinite(normalizedPrecioCondicion) || normalizedPrecioCondicion <= 0)
    ) {
      setOrderError(`Ingresa un precio ${tipoOrden === 'stop' ? 'stop' : 'limite'} valido mayor a cero.`)
      setOrderMessage(null)
      return
    }

    setIsSubmitting(true)
    setOrderError(null)
    setOrderMessage(null)

    try {
      const response = await createPortfolioOrder(
        {
          simbolo: accion.simbolo,
          tipoOperacion,
          cantidad: normalizedCantidad,
          tipoOrden,
          precioLimite: requiresTriggerPrice ? normalizedPrecioCondicion : undefined,
        },
        token,
      )
      setOrderMessage(response.mensaje)
      setCantidad('')
      setTipoOrden('mercado')
      setPrecioCondicion('')
      onOrderSuccess?.()
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'No se pudo crear la orden.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

          <div className='mt-4 rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
            <div className='flex items-center justify-between gap-3 text-sm text-[var(--bg-muted)]'>
              <span>Costo de la operación</span>
              <span className='font-medium text-[var(--bg-text)]'>{formatCurrency(costoOperacion)}</span>
            </div>
            <div className='mt-3 flex items-center justify-between gap-3 text-sm text-[var(--bg-muted)]'>
              <span>Valor al precio actual</span>
              <span className='font-medium text-[var(--bg-text)]'>{formatCurrency(valorActualOperacion)}</span>
            </div>
          </div>

          <div className='mt-4'>
            <Input
              type='number'
              placeholder='Cantidad de acciones'
              min='0'
              step='0.0001'
              value={cantidad}
              onChange={(event) => setCantidad(event.target.value)}
            />
          </div>

          <div className='mt-3 grid gap-3 sm:grid-cols-2'>
            <Select
              value={tipoOrden}
              onChange={(event) => setTipoOrden(event.target.value as TipoOrdenBroker)}
              options={[
                { value: 'mercado', label: 'Orden de mercado' },
                { value: 'limite', label: 'Orden limite' },
                { value: 'stop', label: 'Orden stop' },
              ]}
            />
            {tipoOrden === 'limite' || tipoOrden === 'stop' ? (
              <Input
                type='number'
                placeholder={tipoOrden === 'stop' ? 'Precio stop' : 'Precio limite'}
                min='0'
                step='0.01'
                value={precioCondicion}
                onChange={(event) => setPrecioCondicion(event.target.value)}
              />
            ) : (
              <div className='flex items-center rounded-xl border border-[var(--bg-border)] bg-[#10141A] px-4 text-sm text-[var(--bg-muted)]'>
                Se usara el precio actual del mercado.
              </div>
            )}
          </div>

          {orderError ? (
            <div className='mt-3 rounded-xl border border-[#5A2A31] bg-[#2A1418] px-3 py-2 text-sm text-[#FFB3B3]'>
              {orderError}
            </div>
          ) : null}

          {orderMessage ? (
            <div className='mt-3 rounded-xl border border-[#244E35] bg-[#13241A] px-3 py-2 text-sm text-[#B8F3CB]'>
              {orderMessage}
            </div>
          ) : null}

          <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Button
              titulo={isSubmitting ? 'Enviando...' : 'Vender'}
              color='#C24141'
              textColor='#ffffff'
              className='h-11 rounded-xl text-base'
              disabled={isSubmitting}
              onClick={() => { void handleOrder('venta') }}
            />
            <Button
              titulo={isSubmitting ? 'Enviando...' : 'Comprar más'}
              color='#25B161'
              textColor='#ffffff'
              className='h-11 rounded-xl text-base'
              disabled={isSubmitting}
              onClick={() => { void handleOrder('compra') }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
