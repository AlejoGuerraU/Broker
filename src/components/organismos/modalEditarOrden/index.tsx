import React, { useState } from 'react'
import Button from '@/components/atoms/button'
import Icon from '@/components/atoms/icon'
import Input from '@/components/atoms/input'
import type { OrdenHistorialItem } from '@/types/portafolio'

interface ModalEditarOrdenProps {
  isOpen: boolean
  orden: OrdenHistorialItem | null
  isSubmitting?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: { cantidad: number; precioLimite?: number }) => Promise<void> | void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const Index = ({
  isOpen,
  orden,
  isSubmitting = false,
  error,
  onClose,
  onSubmit,
}: ModalEditarOrdenProps) => {
  const [cantidad, setCantidad] = useState(orden ? String(orden.cantidad) : '')
  const [precioLimite, setPrecioLimite] = useState(
    orden?.tipoOrden === 'limite' ? String(orden.precio) : '',
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  if (!isOpen || !orden) {
    return null
  }

  const handleSubmit = async () => {
    const normalizedCantidad = Number(cantidad)

    if (!Number.isFinite(normalizedCantidad) || normalizedCantidad <= 0) {
      setValidationError('Ingresa una cantidad valida mayor a cero.')
      return
    }

    if (orden.tipoOrden === 'limite') {
      const normalizedPrecioLimite = Number(precioLimite)

      if (!Number.isFinite(normalizedPrecioLimite) || normalizedPrecioLimite <= 0) {
        setValidationError('Ingresa un precio limite valido mayor a cero.')
        return
      }

      setValidationError(null)
      await onSubmit({
        cantidad: normalizedCantidad,
        precioLimite: normalizedPrecioLimite,
      })
      return
    }

    setValidationError(null)
    await onSubmit({ cantidad: normalizedCantidad })
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/55 px-3 py-3 sm:px-4 sm:py-4'>
      <div className='flex min-h-full items-start justify-center sm:items-center'>
        <div className='max-h-[calc(100vh-1.5rem)] w-full max-w-[520px] overflow-y-auto rounded-[20px] border border-[var(--bg-border)] bg-[var(--card-color)] p-4 sm:max-h-[calc(100vh-2rem)] sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]'>
          <div className='mb-5 flex items-start justify-between gap-3'>
            <div>
              <h2 className='text-[20px] font-semibold leading-none text-[var(--bg-text)]'>
                Editar orden {orden.activo}
              </h2>
              <p className='mt-2 text-sm text-[var(--bg-muted)]'>
                Solo puedes modificar ordenes con estado pendiente.
              </p>
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
              <p className='text-sm text-[var(--bg-muted)]'>Operacion</p>
              <p className='mt-2 text-lg font-semibold capitalize text-[var(--bg-text)]'>{orden.tipo}</p>
            </article>
            <article className='rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
              <p className='text-sm text-[var(--bg-muted)]'>Tipo de orden</p>
              <p className='mt-2 text-lg font-semibold capitalize text-[var(--bg-text)]'>{orden.tipoOrden}</p>
            </article>
          </div>

          <div className='mt-4 space-y-4'>
            <Input
              type='number'
              placeholder='Cantidad'
              min='0'
              step='0.0001'
              value={cantidad}
              onChange={(event) => setCantidad(event.target.value)}
            />

            {orden.tipoOrden === 'limite' ? (
              <Input
                type='number'
                placeholder='Precio limite'
                min='0'
                step='0.01'
                value={precioLimite}
                onChange={(event) => setPrecioLimite(event.target.value)}
              />
            ) : (
              <div className='rounded-xl border border-[var(--bg-border)] bg-[#10141A] px-4 py-3 text-sm text-[var(--bg-muted)]'>
                El precio de referencia se recalculara con el valor actual del mercado.
              </div>
            )}
          </div>

          <div className='mt-4 rounded-2xl border border-[var(--bg-border)] bg-[#10141A] p-4'>
            <div className='flex items-center justify-between gap-3 text-sm text-[var(--bg-muted)]'>
              <span>Precio actual de referencia</span>
              <span className='font-medium text-[var(--bg-text)]'>{formatCurrency(orden.precio)}</span>
            </div>
          </div>

          {validationError ? (
            <div className='mt-4 rounded-xl border border-[#5A2A31] bg-[#2A1418] px-3 py-2 text-sm text-[#FFB3B3]'>
              {validationError}
            </div>
          ) : null}

          {error ? (
            <div className='mt-4 rounded-xl border border-[#5A2A31] bg-[#2A1418] px-3 py-2 text-sm text-[#FFB3B3]'>
              {error}
            </div>
          ) : null}

          <div className='mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <Button
              titulo='Cerrar'
              color='#171B21'
              textColor='#E6EBF0'
              className='h-11 rounded-xl text-base'
              onClick={onClose}
              disabled={isSubmitting}
            />
            <Button
              titulo={isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              color='#25B161'
              textColor='#E6EBF0'
              className='h-11 rounded-xl text-base'
              onClick={() => {
                void handleSubmit()
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
