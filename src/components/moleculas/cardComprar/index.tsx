import React from 'react'
import Input from '@/components/atoms/input'
import Button from '@/components/atoms/button'
import { BigText, SubTexto, SubTitle } from '@/components/atoms/heroTitles'
import type { TipoOperacionBroker, TipoOrdenBroker } from '@/types/market'

interface CardComprarProps {
  nombreAccion?: string
  simbolo?: string
  precio?: string
  variacion?: number
  cantidad?: string
  tipoOrden?: TipoOrdenBroker
  precioLimite?: string
  onCantidadChange?: (value: string) => void
  onPrecioLimiteChange?: (value: string) => void
  tipoOperacion?: TipoOperacionBroker
  onTipoOperacionChange?: (value: TipoOperacionBroker) => void
  onTipoOrdenChange?: (value: TipoOrdenBroker) => void
  onSubmit?: () => void
  isSubmitting?: boolean
  isRefreshingPrice?: boolean
  marketStatusLabel?: string
  mensaje?: string | null
  error?: string | null
}

const Index = ({
  nombreAccion = 'Selecciona una accion',
  simbolo = '---',
  precio = '$0.00',
  variacion = 0,
  cantidad = '',
  tipoOrden = 'mercado',
  precioLimite = '',
  onCantidadChange,
  onPrecioLimiteChange,
  tipoOperacion = 'compra',
  onTipoOperacionChange,
  onTipoOrdenChange,
  onSubmit,
  isSubmitting = false,
  isRefreshingPrice = false,
  marketStatusLabel,
  mensaje,
  error,
}: CardComprarProps) => {
  const esPositiva = variacion >= 0
  const actionLabel = tipoOperacion === 'compra' ? 'Comprar' : 'Vender'

  return (
    <div className='flex w-full flex-col gap-4 rounded-2xl border border-[var(--bg-border)] bg-[var(--card-color)] p-4 sm:p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1'>
      <div className='space-y-2'>
        <SubTitle text='Operar acciones' />
        <div className='space-y-1'>
          <SubTexto text={`${nombreAccion} - ${simbolo}`} className='break-words text-[var(--bg-muted)]' />
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

      <div className='grid grid-cols-2 gap-2'>
        <Button
          titulo='Mercado'
          color={tipoOrden === 'mercado' ? '#4DA3FF' : '#171B21'}
          textColor='#E6EBF0'
          className={tipoOrden === 'mercado' ? 'border-transparent' : ''}
          onClick={() => onTipoOrdenChange?.('mercado')}
        />
        <Button
          titulo='Limite'
          color={tipoOrden === 'limite' ? '#F0A63A' : '#171B21'}
          textColor='#E6EBF0'
          className={tipoOrden === 'limite' ? 'border-transparent' : ''}
          onClick={() => onTipoOrdenChange?.('limite')}
        />
      </div>

      {tipoOrden === 'limite' ? (
        <Input
          type='number'
          placeholder='Precio limite'
          min='0'
          step='0.01'
          value={precioLimite}
          onChange={(event) => onPrecioLimiteChange?.(event.target.value)}
        />
      ) : null}

      <div className='rounded-xl border border-[var(--bg-border)] bg-[#10141A] px-3 py-3 text-sm text-[var(--bg-muted)]'>
        {tipoOrden === 'mercado'
          ? marketStatusLabel ?? 'La orden tomara el precio actual del activo.'
          : 'La orden limite usa el precio que indiques como referencia para crear la orden.'}
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
