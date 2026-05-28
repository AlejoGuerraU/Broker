import React from 'react'
import Input from '@/components/atoms/input'
import Button from '@/components/atoms/button'
import Select from '@/components/atoms/select'
import { BigText, SubTexto, SubTitle } from '@/components/atoms/heroTitles'
import type { TipoOperacionBroker, TipoOrdenBroker } from '@/types/market'

interface CardComprarProps {
  nombreAccion?: string
  simbolo?: string
  precio?: string
  variacion?: number
  cantidad?: string
  onCantidadChange?: (value: string) => void
  tipoOperacion?: TipoOperacionBroker
  onTipoOperacionChange?: (value: TipoOperacionBroker) => void
  tipoOrden?: TipoOrdenBroker
  onTipoOrdenChange?: (value: TipoOrdenBroker) => void
  precioCondicion?: string
  onPrecioCondicionChange?: (value: string) => void
  onSubmit?: () => void
  isSubmitting?: boolean
  isRefreshingPrice?: boolean
  mensaje?: string | null
  error?: string | null
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const parseCurrencyString = (value: string): number => {
  // Admite "$1,234.56", "1234.56", "1.234,56" (best-effort)
  const trimmed = value.trim()
  if (!trimmed) {
    return NaN
  }

  const numeric = trimmed.replace(/[^\d.,-]/g, '')
  if (!numeric) {
    return NaN
  }

  const lastComma = numeric.lastIndexOf(',')
  const lastDot = numeric.lastIndexOf('.')

  if (lastComma > lastDot) {
    // "1.234,56" => "1234.56"
    return Number(numeric.replace(/\./g, '').replace(',', '.'))
  }

  // "1,234.56" o "1234.56" => "1234.56"
  return Number(numeric.replace(/,/g, ''))
}

const Index = ({
  nombreAccion = 'Selecciona una accion',
  simbolo = '---',
  precio = '$0.00',
  variacion = 0,
  cantidad = '',
  onCantidadChange,
  tipoOperacion = 'compra',
  onTipoOperacionChange,
  tipoOrden = 'mercado',
  onTipoOrdenChange,
  precioCondicion = '',
  onPrecioCondicionChange,
  onSubmit,
  isSubmitting = false,
  isRefreshingPrice = false,
  mensaje,
  error,
}: CardComprarProps) => {
  const esPositiva = variacion >= 0
  const actionLabel = tipoOperacion === 'compra' ? 'Comprar' : 'Vender'
  const requiresTriggerPrice = tipoOrden === 'limite' || tipoOrden === 'stop'
  const triggerPriceLabel = tipoOrden === 'stop' ? 'Precio stop' : 'Precio limite'
  const normalizedCantidad = Number(cantidad)
  const marketPrice = parseCurrencyString(precio)
  const triggerPrice = Number(precioCondicion)
  const referencePrice = requiresTriggerPrice ? triggerPrice : marketPrice
  const hasValidCantidad = Number.isFinite(normalizedCantidad) && normalizedCantidad > 0
  const hasValidReferencePrice = Number.isFinite(referencePrice) && referencePrice > 0
  const estimatedCost = hasValidCantidad && hasValidReferencePrice ? normalizedCantidad * referencePrice : 0

  return (
    <div className='flex w-full flex-col gap-4 rounded-2xl border border-[var(--bg-border)] bg-[var(--card-color)] p-4 sm:p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1'>
      <div className='space-y-2'>
        <SubTitle text='Operar acciones' />
        <div className='space-y-1'>
          <SubTexto text={`${nombreAccion} · ${simbolo}`} className='break-words text-[var(--bg-muted)]' />
          <BigText text={precio} className='font-semibold text-[var(--bg-text)]' />
          {isRefreshingPrice ? (
            <SubTexto text='Actualizando precio...' className='text-[var(--bg-muted)]' />
          ) : null}
          <SubTexto
            text={`${esPositiva ? '+' : ''}${variacion.toFixed(2)}% hoy`}
            className={esPositiva ? 'text-[#25B161]' : 'text-[#FF6B6B]'}
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <Button
          titulo='Comprar'
          color={tipoOperacion === 'compra' ? '#25B161' : '#171B21'}
          textColor='#E6EBF0'
          className={tipoOperacion === 'compra' ? 'border-transparent' : ''}
          onClick={() => onTipoOperacionChange?.('compra')}
        />
        <Button
          titulo='Vender'
          color={tipoOperacion === 'venta' ? '#FF6B6B' : '#171B21'}
          textColor='#E6EBF0'
          className={tipoOperacion === 'venta' ? 'border-transparent' : ''}
          onClick={() => onTipoOperacionChange?.('venta')}
        />
      </div>

      <Input
        type='number'
        placeholder='Cantidad de acciones'
        min='0'
        step='0.0001'
        value={cantidad}
        onChange={(event) => onCantidadChange?.(event.target.value)}
      />

      <div className='grid gap-3 sm:grid-cols-2'>
        <Select
          value={tipoOrden}
          onChange={(event) => onTipoOrdenChange?.(event.target.value as TipoOrdenBroker)}
          options={[
            { value: 'mercado', label: 'Orden de mercado' },
            { value: 'limite', label: 'Orden limite' },
            { value: 'stop', label: 'Orden stop' },
          ]}
        />

        {requiresTriggerPrice ? (
          <Input
            type='number'
            placeholder={triggerPriceLabel}
            min='0'
            step='0.01'
            value={precioCondicion}
            onChange={(event) => onPrecioCondicionChange?.(event.target.value)}
          />
        ) : (
          <div className='flex items-center rounded-xl border border-[var(--bg-border)] bg-[#10141A] px-4 text-sm text-[var(--bg-muted)]'>
            Se usara el precio actual del mercado.
          </div>
        )}
      </div>

      <div className='rounded-xl border border-[var(--bg-border)] bg-[#10141A] px-4 py-3'>
        <div className='flex items-center justify-between gap-3 text-sm text-[var(--bg-muted)]'>
          <span>{requiresTriggerPrice ? 'Precio de referencia' : 'Precio actual (referencia)'}</span>
          <span className='font-medium text-[var(--bg-text)]'>
            {formatCurrency(hasValidReferencePrice ? referencePrice : 0)}
          </span>
        </div>
        <div className='mt-2 flex items-center justify-between gap-3 text-sm text-[var(--bg-muted)]'>
          <span>Costo estimado (Cantidad x Precio)</span>
          <span className='font-semibold text-[var(--bg-text)]'>
            {formatCurrency(estimatedCost)}
          </span>
        </div>
      </div>

      {mensaje ? (
        <div className='rounded-xl border border-[#244E35] bg-[#13241A] px-3 py-2 text-sm text-[#B8F3CB]'>
          {mensaje}
        </div>
      ) : null}

      {error ? (
        <div className='rounded-xl border border-[#5A2A31] bg-[#2A1418] px-3 py-2 text-sm text-[#FFB3B3]'>
          {error}
        </div>
      ) : null}

      <Button
        titulo={isSubmitting ? `${actionLabel}...` : actionLabel}
        color={tipoOperacion === 'compra' ? '#25B161' : '#FF6B6B'}
        textColor='#E6EBF0'
        disabled={isSubmitting || isRefreshingPrice}
        onClick={onSubmit}
      />
    </div>
  )
}

export default Index
