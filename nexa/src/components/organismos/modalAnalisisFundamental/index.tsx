import React from 'react'
import Button from '@/components/atoms/button'
import Icon from '@/components/atoms/icon'
import { SubTexto, SubTextoMini, SubTitle } from '@/components/atoms/heroTitles'
import type { AnalisisFundamentalMercado } from '@/types/market'

interface ModalAnalisisFundamentalProps {
  isOpen: boolean
  simbolo?: string
  isLoading?: boolean
  error?: string | null
  data?: AnalisisFundamentalMercado | null
  onClose: () => void
}

interface IndicadorProps {
  etiqueta: string
  valor: string
  destaque?: boolean
}

const formatNumber = (value: number | null | undefined, digits = 2) => {
  if (value == null || !Number.isFinite(value)) {
    return 'N/D'
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value)
}

const formatCompactCurrency = (value: number | null | undefined, currency = 'USD') => {
  if (value == null || !Number.isFinite(value)) {
    return 'N/D'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatCurrency = (value: number | null | undefined, currency = 'USD') => {
  if (value == null || !Number.isFinite(value)) {
    return 'N/D'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatPercent = (value: number | null | undefined) => {
  if (value == null || !Number.isFinite(value)) {
    return 'N/D'
  }

  return `${(value * 100).toFixed(2)}%`
}

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return 'N/D'
  }

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatTimestamp = (value: string | null | undefined) => {
  if (!value) {
    return 'Sin registro'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const Indicador = ({ etiqueta, valor, destaque = false }: IndicadorProps) => (
  <article
    className={`rounded-2xl border p-4 ${
      destaque
        ? 'border-[#244E35] bg-[linear-gradient(180deg,#14261B_0%,#10161D_100%)]'
        : 'border-[var(--bg-border)] bg-[#10141A]'
    }`}
  >
    <p className='text-xs uppercase tracking-[0.18em] text-[var(--bg-muted)]'>{etiqueta}</p>
    <p className='mt-2 text-lg font-semibold text-[var(--bg-text)]'>{valor}</p>
  </article>
)

const Seccion = ({
  titulo,
  children,
}: React.PropsWithChildren<{ titulo: string }>) => (
  <section className='space-y-3'>
    <SubTexto text={titulo} className='font-semibold uppercase tracking-[0.18em] text-[var(--bg-muted)]' />
    {children}
  </section>
)

const Index = ({
  isOpen,
  simbolo,
  isLoading = false,
  error,
  data,
  onClose,
}: ModalAnalisisFundamentalProps) => {
  if (!isOpen) {
    return null
  }

  const currency = data?.moneda ?? 'USD'

  return (
    <div className='fixed inset-0 z-50 bg-black/65 px-3 py-3 sm:px-4 sm:py-4'>
      <div className='flex min-h-full items-start justify-center sm:items-center'>
        <div className='max-h-[calc(100vh-1.5rem)] w-full max-w-[940px] overflow-y-auto rounded-[24px] border border-[var(--bg-border)] bg-[linear-gradient(180deg,#13181F_0%,#0D1015_100%)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:max-h-[calc(100vh-2rem)] sm:p-6'>
          <div className='mb-5 flex items-start justify-between gap-3'>
            <div className='space-y-2'>
              <SubTitle text={`Analisis fundamental ${simbolo ?? ''}`.trim()} className='text-[var(--bg-text)]' />
              <SubTexto
                text={data?.nombreEmpresa ?? 'Consulta los principales indicadores de la accion seleccionada.'}
                className='text-[var(--bg-muted)]'
              />
              {data ? (
                <SubTextoMini
                  text={`Actualizado: ${formatTimestamp(data.fechaActualizacion)}`}
                  className='text-[var(--bg-muted)]'
                />
              ) : null}
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

          {isLoading ? (
            <div className='rounded-3xl border border-[var(--bg-border)] bg-[#10141A] px-5 py-10 text-center'>
              <SubTexto text='Cargando analisis fundamental...' className='text-[var(--bg-text)]' />
              <SubTextoMini
                text='Se consultan los indicadores solo cuando abres este modulo.'
                className='mt-2 text-[var(--bg-muted)]'
              />
            </div>
          ) : error ? (
            <div className='rounded-3xl border border-[#5A2A31] bg-[#2A1418] px-5 py-6'>
              <SubTexto text={error} className='text-[#FFB3B3]' />
              <SubTextoMini
                text='Si existe informacion persistida, el backend intenta devolverte el ultimo respaldo disponible.'
                className='mt-2 text-[#E7C0C0]'
              />
            </div>
          ) : data ? (
            <div className='space-y-6'>
              <div className='grid gap-3 md:grid-cols-4'>
                <Indicador etiqueta='P/E' valor={formatNumber(data.perRatio)} destaque />
                <Indicador etiqueta='P/B' valor={formatNumber(data.priceToBookRatio)} destaque />
                <Indicador etiqueta='ROE' valor={formatPercent(data.returnOnEquityTtm)} destaque />
                <Indicador etiqueta='Margen neto' valor={formatPercent(data.profitMargin)} destaque />
              </div>

              <div className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
                <div className='rounded-3xl border border-[var(--bg-border)] bg-[#10141A] p-5'>
                  <div className='flex flex-wrap gap-2'>
                    {[data.sector, data.industria, data.pais, data.mercado].filter(Boolean).map((item) => (
                      <span
                        key={item}
                        className='rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-medium text-[var(--bg-text)]'
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <p className='mt-4 text-sm leading-6 text-[var(--bg-muted)]'>
                    {data.descripcion ?? 'Alpha Vantage no entrego descripcion para este simbolo.'}
                  </p>
                </div>

                <div className='grid gap-3'>
                  <Indicador etiqueta='Market Cap' valor={formatCompactCurrency(data.capitalizacionMercado, currency)} />
                  <Indicador etiqueta='EBITDA' valor={formatCompactCurrency(data.ebitda, currency)} />
                  <Indicador etiqueta='Target analista' valor={formatCurrency(data.analystTargetPrice, currency)} />
                </div>
              </div>

              <Seccion titulo='Valoracion'>
                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                  <Indicador etiqueta='Forward P/E' valor={formatNumber(data.forwardPer)} />
                  <Indicador etiqueta='PEG' valor={formatNumber(data.pegRatio)} />
                  <Indicador etiqueta='P/S TTM' valor={formatNumber(data.priceToSalesRatioTtm)} />
                  <Indicador etiqueta='Book Value' valor={formatCurrency(data.bookValue, currency)} />
                  <Indicador etiqueta='EV/Revenue' valor={formatNumber(data.evToRevenue)} />
                  <Indicador etiqueta='EV/EBITDA' valor={formatNumber(data.evToEbitda)} />
                  <Indicador etiqueta='EPS' valor={formatCurrency(data.eps, currency)} />
                  <Indicador etiqueta='Diluted EPS TTM' valor={formatCurrency(data.dilutedEpsTtm, currency)} />
                </div>
              </Seccion>

              <Seccion titulo='Rentabilidad y crecimiento'>
                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                  <Indicador etiqueta='ROA' valor={formatPercent(data.returnOnAssetsTtm)} />
                  <Indicador etiqueta='Operating Margin' valor={formatPercent(data.operatingMarginTtm)} />
                  <Indicador etiqueta='Revenue Growth YoY' valor={formatPercent(data.quarterlyRevenueGrowthYoy)} />
                  <Indicador etiqueta='Earnings Growth YoY' valor={formatPercent(data.quarterlyEarningsGrowthYoy)} />
                  <Indicador etiqueta='Revenue TTM' valor={formatCompactCurrency(data.revenueTtm, currency)} />
                  <Indicador etiqueta='Gross Profit TTM' valor={formatCompactCurrency(data.grossProfitTtm, currency)} />
                  <Indicador etiqueta='Revenue/Share TTM' valor={formatCurrency(data.revenuePerShareTtm, currency)} />
                  <Indicador etiqueta='Shares Outstanding' valor={formatNumber(data.sharesOutstanding, 0)} />
                </div>
              </Seccion>

              <Seccion titulo='Riesgo, rango y dividendos'>
                <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                  <Indicador etiqueta='Beta' valor={formatNumber(data.beta)} />
                  <Indicador etiqueta='52W High' valor={formatCurrency(data.week52High, currency)} />
                  <Indicador etiqueta='52W Low' valor={formatCurrency(data.week52Low, currency)} />
                  <Indicador etiqueta='MA 50 dias' valor={formatCurrency(data.movingAverage50Day, currency)} />
                  <Indicador etiqueta='MA 200 dias' valor={formatCurrency(data.movingAverage200Day, currency)} />
                  <Indicador etiqueta='Dividendo/accion' valor={formatCurrency(data.dividendPerShare, currency)} />
                  <Indicador etiqueta='Dividend Yield' valor={formatPercent(data.dividendYield)} />
                  <Indicador etiqueta='Ex-Dividend Date' valor={formatDate(data.exDividendDate)} />
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <Indicador etiqueta='Dividend Date' valor={formatDate(data.dividendDate)} />
                  <Indicador etiqueta='Moneda' valor={data.moneda ?? 'N/D'} />
                </div>
              </Seccion>
            </div>
          ) : (
            <div className='rounded-3xl border border-[var(--bg-border)] bg-[#10141A] px-5 py-10 text-center'>
              <SubTexto text='No hay datos de analisis para mostrar.' className='text-[var(--bg-text)]' />
            </div>
          )}

          <div className='mt-6 flex justify-end'>
            <Button
              titulo='Cerrar'
              color='#171B21'
              textColor='#E6EBF0'
              className='h-11 rounded-xl text-base'
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index
