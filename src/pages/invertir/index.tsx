'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MediumTitle, SubTexto, SubTextoMini, SubTitle } from '@/components/atoms/heroTitles'
import Input from '@/components/atoms/input'
import Cardcomprar from '@/components/moleculas/cardComprar'
import CardAcciones from '@/components/moleculas/cardAcciones'
import Carrusel from '@/components/organismos/carrusel'
import {
  createPortfolioOrder,
  getMarketAssetDetail,
  getMostActiveStocks,
  getMarketStatus,
} from '@/services/market'
import type {
  AccionMercadoItem,
  CrearOrdenRespuesta,
  DetalleActivoMercado,
  EstadoMercado,
  TipoOperacionBroker,
} from '@/types/market'

const fallbackChartStock: AccionMercadoItem = {
  id: 0,
  nombre: 'Mercado',
  simbolo: '---',
  precio: '$0.00',
  variacion: 0,
  logoTexto: '--',
  logoClase: 'bg-[#2A313A] text-[#E6EBF0]',
}

const chartLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const parsePrecio = (precio: string) => Number(precio.replace('$', '').replace(/,/g, ''))

const formatPrice = (precio: number, moneda = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(precio)

const buildSeriesFromStock = (accion: AccionMercadoItem) => {
  const precioBase = parsePrecio(accion.precio)
  const offsets = [-0.042, -0.018, -0.031, 0.012, 0.026, 0.019, accion.variacion / 100]
  const portfolioOffsets = [-0.016, -0.01, -0.006, 0.004, 0.011, 0.015, 0.018]

  return [
    {
      label: accion.simbolo,
      values: offsets.map((offset) => Number((precioBase * (1 + offset)).toFixed(2))),
      color: accion.variacion >= 0 ? '#25B161' : '#FF6B6B',
    },
    {
      label: 'Portafolio',
      values: portfolioOffsets.map((offset) => Number((precioBase * 0.92 * (1 + offset)).toFixed(2))),
      color: '#4DA3FF',
      fill: false,
    },
  ]
}

const Index = () => {
  const { data: session } = useSession()
  const [acciones, setAcciones] = useState<AccionMercadoItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [cantidad, setCantidad] = useState('')
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacionBroker>('compra')
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [isRefreshingSelectedPrice, setIsRefreshingSelectedPrice] = useState(false)
  const [orderMessage, setOrderMessage] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [marketError, setMarketError] = useState<string | null>(null)
  const [marketStatus, setMarketStatus] = useState<EstadoMercado | null>(null)

  useEffect(() => {
    let ignore = false

    const loadMostActive = async () => {
      try {
        const [marketItems, status] = await Promise.all([
          getMostActiveStocks(),
          getMarketStatus(),
        ])

        if (!ignore && marketItems.length > 0) {
          setAcciones(marketItems)
          setMarketStatus(status)
          setMarketError(null)
          setSelectedId((currentSelectedId) => {
            const stillExists = marketItems.some((accion) => accion.id === currentSelectedId)
            return stillExists ? currentSelectedId : marketItems[0].id
          })
        }
      } catch (error) {
        if (!ignore) {
          setMarketError(error instanceof Error ? error.message : 'No se pudo cargar el mercado.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadMostActive()

    return () => {
      ignore = true
    }
  }, [])

  const accionesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    if (!termino) {
      return acciones
    }

    return acciones.filter((accion) =>
      `${accion.nombre} ${accion.simbolo}`.toLowerCase().includes(termino),
    )
  }, [acciones, busqueda])

  const accionSeleccionada =
    acciones.find((accion) => accion.id === selectedId) ?? acciones[0] ?? null

  const applyAssetDetail = (detail: DetalleActivoMercado) => {
    setAcciones((currentAcciones) =>
      currentAcciones.map((accion) =>
        accion.simbolo === detail.simbolo
          ? {
              ...accion,
              nombre: detail.nombre,
              precio: formatPrice(detail.precioActual, detail.moneda),
              variacion: detail.variacionDiaria,
            }
          : accion,
      ),
    )
  }

  useEffect(() => {
    setCantidad('')
    setOrderMessage(null)
    setOrderError(null)
  }, [selectedId])

  useEffect(() => {
    if (!accionSeleccionada?.simbolo) {
      return
    }

    let ignore = false

    const refreshSelectedAsset = async () => {
      setIsRefreshingSelectedPrice(true)

      try {
        const detail = await getMarketAssetDetail(accionSeleccionada.simbolo)

        if (!ignore) {
          applyAssetDetail(detail)
        }
      } catch {
      } finally {
        if (!ignore) {
          setIsRefreshingSelectedPrice(false)
        }
      }
    }

    refreshSelectedAsset()

    return () => {
      ignore = true
    }
  }, [accionSeleccionada?.simbolo])

  const seriesSeleccionadas = useMemo(
    () => buildSeriesFromStock(accionSeleccionada ?? fallbackChartStock),
    [accionSeleccionada],
  )

  const refreshMarket = async (currentSelectedId?: number) => {
    const marketItems = await getMostActiveStocks()
    const status = await getMarketStatus()

    if (marketItems.length === 0) {
      return
    }

    setAcciones(marketItems)
    setMarketStatus(status)
    setMarketError(null)
    setSelectedId((previousSelectedId) => {
      const targetId = currentSelectedId ?? previousSelectedId
      const stillExists = marketItems.some((accion) => accion.id === targetId)
      return stillExists ? targetId : marketItems[0].id
    })
  }

  const handleSubmitOrder = async () => {
    if (!accionSeleccionada) {
      setOrderMessage(null)
      setOrderError('Selecciona una accion antes de crear una orden.')
      return
    }

    const normalizedCantidad = Number(cantidad)

    if (!Number.isFinite(normalizedCantidad) || normalizedCantidad <= 0) {
      setOrderMessage(null)
      setOrderError('Ingresa una cantidad valida mayor a cero.')
      return
    }

    setIsSubmittingOrder(true)
    setOrderMessage(null)
    setOrderError(null)

    try {
      const detail = await getMarketAssetDetail(accionSeleccionada.simbolo)
      applyAssetDetail(detail)

      const response: CrearOrdenRespuesta = await createPortfolioOrder({
        simbolo: accionSeleccionada.simbolo,
        tipoOperacion,
        cantidad: normalizedCantidad,
        tipoOrden: 'mercado',
      }, session?.accessToken)

      setOrderMessage(response.mensaje)
      setCantidad('')
      await refreshMarket(accionSeleccionada.id)
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'No se pudo crear la orden.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  return (
    <div className='space-y-5 p-4 sm:space-y-6'>
      <MediumTitle text={'Invertir'} className='leading-none' />

      <Carrusel
        titulo='Mas Negociadas'
        acciones={acciones}
        isLoading={isLoading}
        sourceLabel='Datos obtenidos desde el backend'
      />

      <div className='flex w-full gap-2 md:w-3/5'>
        <Input
          type={'text'}
          placeholder={'Buscar inversion...'}
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
      </div>

      {marketStatus ? (
        <div
          className={`rounded-2xl border px-4 py-3 ${
            marketStatus.mercadoAbierto
              ? 'border-[#244E35] bg-[#13241A]'
              : 'border-[#5A4A24] bg-[#241E13]'
          }`}
        >
          <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
            <SubTexto
              text={marketStatus.mercadoAbierto ? 'Mercado abierto' : 'Mercado cerrado'}
              className={marketStatus.mercadoAbierto ? 'text-[#B8F3CB]' : 'text-[#F6D38B]'}
            />
            <SubTextoMini
              text={`Fuente: ${marketStatus.fuente} · Zona: ${marketStatus.zonaHorariaMercado}`}
              className='text-[var(--bg-muted)]'
            />
          </div>
          <SubTextoMini
            text={
              marketStatus.mercadoAbierto
                ? 'Las ordenes de mercado pueden ejecutarse inmediatamente.'
                : 'Las ordenes nuevas quedaran pendientes hasta que exista logica de ejecucion posterior.'
            }
            className='mt-1 text-[var(--bg-muted)]'
          />
        </div>
      ) : null}

      <section className='grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-6'>
        <aside className='rounded-[28px] border border-[var(--bg-border)] bg-[#0F1318] p-4 sm:p-5 md:p-6'>
          <div className='mb-5 space-y-1'>
            <SubTitle text='Listado de acciones' className='text-[var(--bg-text)]' />
            <SubTextoMini
              text={isLoading ? 'Cargando mercado...' : 'Selecciona una accion de la lista'}
              className='text-[var(--bg-muted)]'
            />
            {marketError ? (
              <SubTextoMini
                text={marketError}
                className='text-[#FF8A8A]'
              />
            ) : null}
          </div>

          <div className='space-y-2'>
            {accionesFiltradas.length > 0 ? (
              accionesFiltradas.map((accion) => {
                const activa = accionSeleccionada ? accion.id === accionSeleccionada.id : false
                const positiva = accion.variacion >= 0

                return (
                  <button
                    key={accion.id}
                    type='button'
                    onClick={() => setSelectedId(accion.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 sm:px-4 text-left transition ${
                      activa
                        ? 'border-[#25B161] bg-[#18241E]'
                        : 'border-[var(--bg-border)] bg-[#171B21] hover:border-white/10 hover:bg-[#1A2027]'
                    }`}
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${accion.logoClase}`}
                      >
                        {accion.logoTexto}
                      </div>

                      <div className='min-w-0'>
                        <SubTexto text={accion.nombre} className='truncate font-semibold text-[var(--bg-text)]' />
                        <SubTextoMini text={accion.simbolo} className='truncate text-[var(--bg-muted)]' />
                      </div>
                    </div>

                    <div className='shrink-0 text-right'>
                      <p className='text-sm font-semibold text-[var(--bg-text)]'>{accion.precio}</p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          positiva ? 'bg-[#1D2C24] text-[#B8F3CB]' : 'bg-[#3B1D24] text-[#FF8A8A]'
                        }`}
                      >
                        {positiva ? '+' : ''}
                        {accion.variacion.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className='rounded-3xl border border-[var(--bg-border)] bg-[#171B21] px-4 py-8 text-center'>
                <SubTexto
                  text={marketError ? 'No hay datos de mercado disponibles en este momento.' : 'No hay acciones que coincidan con tu busqueda.'}
                  className='text-[var(--bg-muted)]'
                />
              </div>
            )}
          </div>
        </aside>

        <div className='space-y-6'>
          <CardAcciones
            titulo={`Movimiento de ${accionSeleccionada?.nombre ?? 'mercado'}`}
            descripcion={`Comparativa semanal de ${accionSeleccionada?.simbolo ?? '---'} frente al portafolio`}
            valorActual={accionSeleccionada?.precio ?? '$0.00'}
            variacion={accionSeleccionada ? `${accionSeleccionada.variacion >= 0 ? '+' : ''}${accionSeleccionada.variacion.toFixed(2)}% hoy` : 'Sin datos'}
            labels={chartLabels}
            series={seriesSeleccionadas}
            xAxisLabel='Periodo'
            yAxisLabel='Precio'
            showLegend
          />

          <Cardcomprar
            nombreAccion={accionSeleccionada?.nombre}
            simbolo={accionSeleccionada?.simbolo}
            precio={accionSeleccionada?.precio}
            variacion={accionSeleccionada?.variacion}
            cantidad={cantidad}
            onCantidadChange={setCantidad}
            tipoOperacion={tipoOperacion}
            onTipoOperacionChange={setTipoOperacion}
            onSubmit={handleSubmitOrder}
            isSubmitting={isSubmittingOrder}
            isRefreshingPrice={isRefreshingSelectedPrice}
            mensaje={orderMessage}
            error={orderError}
          />
        </div>
      </section>
    </div>
  )
}

export default Index
