'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { MediumTitle, SubTexto, SubTextoMini, SubTitle } from '@/components/atoms/heroTitles'
import Input from '@/components/atoms/input'
import Cardcomprar from '@/components/moleculas/cardComprar'
import CardAcciones from '@/components/moleculas/cardAcciones'
import ModalAnalisisFundamental from '@/components/organismos/modalAnalisisFundamental'
import Carrusel from '@/components/organismos/carrusel'
import {
  createPortfolioOrder,
  getMarketAssetDetail,
  getMarketAssetHistory,
  getMarketFundamentals,
  getMostActiveStocks,
  getMarketStatus,
} from '@/services/market'
import type {
  AccionMercadoItem,
  AnalisisFundamentalMercado,
  CrearOrdenRespuesta,
  DetalleActivoMercado,
  EstadoMercado,
  HistorialActivoMercado,
  PuntoHistorialActivoMercado,
  TipoOperacionBroker,
  TipoOrdenBroker,
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

const parsePrecio = (precio: string) => Number(precio.replace('$', '').replace(/,/g, ''))

const formatPrice = (precio: number, moneda = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(precio)

const formatMarketSource = (fuente: string) => {
  if (fuente === 'alpha_vantage') return 'Alpha Vantage'
  if (fuente === 'finnhub') return 'Finnhub'
  return 'Respaldo local'
}

const formatHistoryLabel = (fecha: string) => {
  const date = new Date(fecha)
  const includesTime =
    date.getHours() !== 0 || date.getMinutes() !== 0 || date.getSeconds() !== 0

  return new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    day: 'numeric',
    ...(includesTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date)
}

const buildChartDataFromHistory = (
  accion: AccionMercadoItem,
  historial: HistorialActivoMercado | null,
) => {
  const puntos = historial?.puntos ?? []

  if (puntos.length > 0) {
    return {
      labels: puntos.map((punto) => formatHistoryLabel(punto.fecha)),
      series: [
        {
          label: accion.simbolo,
          values: puntos.map((punto) => punto.cierre),
          color: accion.variacion >= 0 ? '#25B161' : '#FF6B6B',
        },
      ],
    }
  }

  const precioBase = parsePrecio(accion.precio)

  return {
    labels: ['Actual'],
    series: [
      {
        label: accion.simbolo,
        values: [Number(precioBase.toFixed(2))],
        color: accion.variacion >= 0 ? '#25B161' : '#FF6B6B',
      },
    ],
  }
}

const getPriceRange = (puntos: PuntoHistorialActivoMercado[]) => {
  if (puntos.length === 0) {
    return null
  }

  return puntos.reduce(
    (acc, punto) => ({
      minimo: Math.min(acc.minimo, punto.minimo),
      maximo: Math.max(acc.maximo, punto.maximo),
    }),
    {
      minimo: puntos[0].minimo,
      maximo: puntos[0].maximo,
    },
  )
}

const Index = () => {
  const { data: session } = useSession()
  const [acciones, setAcciones] = useState<AccionMercadoItem[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [cantidad, setCantidad] = useState('')
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacionBroker>('compra')
  const [tipoOrden, setTipoOrden] = useState<TipoOrdenBroker>('mercado')
  const [precioCondicion, setPrecioCondicion] = useState('')
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false)
  const [isRefreshingSelectedPrice, setIsRefreshingSelectedPrice] = useState(false)
  const [orderMessage, setOrderMessage] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [marketError, setMarketError] = useState<string | null>(null)
  const [marketStatus, setMarketStatus] = useState<EstadoMercado | null>(null)
  const [priceHistory, setPriceHistory] = useState<HistorialActivoMercado | null>(null)
  const [isLoadingPriceHistory, setIsLoadingPriceHistory] = useState(false)
  const [isFundamentalModalOpen, setIsFundamentalModalOpen] = useState(false)
  const [isLoadingFundamentals, setIsLoadingFundamentals] = useState(false)
  const [fundamentalsError, setFundamentalsError] = useState<string | null>(null)
  const [fundamentals, setFundamentals] = useState<AnalisisFundamentalMercado | null>(null)

  // Evita llamar a getMarketAssetDetail cuando la seleccion viene de la carga
  // inicial (getMostActiveStocks ya trae datos frescos del backend).
  const skipNextAssetRefresh = useRef(false)

  useEffect(() => {
    let ignore = false

    const loadMostActive = async () => {
      try {
        const marketItems = await getMostActiveStocks()
        const status = await getMarketStatus()

        if (!ignore && marketItems.length > 0) {
          setAcciones(marketItems)
          setMarketStatus(status)
          setMarketError(null)
          // Marcar que la proxima asignacion de selectedId viene de la carga
          // inicial: los datos ya son frescos, no hace falta un segundo fetch.
          skipNextAssetRefresh.current = true
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
    setTipoOrden('mercado')
    setPrecioCondicion('')
    setOrderMessage(null)
    setOrderError(null)
  }, [selectedId])

  useEffect(() => {
    if (!accionSeleccionada?.simbolo) {
      setPriceHistory(null)
      return
    }

    let ignore = false

    const loadPriceHistory = async () => {
      setIsLoadingPriceHistory(true)

      try {
        const data = await getMarketAssetHistory(accionSeleccionada.simbolo)

        if (!ignore) {
          setPriceHistory(data)
        }
      } catch {
        if (!ignore) {
          setPriceHistory(null)
        }
      } finally {
        if (!ignore) {
          setIsLoadingPriceHistory(false)
        }
      }
    }

    void loadPriceHistory()

    return () => {
      ignore = true
    }
  }, [accionSeleccionada?.simbolo])

  useEffect(() => {
    if (!isFundamentalModalOpen || !accionSeleccionada?.simbolo) {
      return
    }

    let ignore = false

    const loadFundamentals = async () => {
      setIsLoadingFundamentals(true)
      setFundamentalsError(null)

      try {
        const data = await getMarketFundamentals(accionSeleccionada.simbolo)

        if (!ignore) {
          setFundamentals(data)
        }
      } catch (error) {
        if (!ignore) {
          setFundamentals(null)
          setFundamentalsError(
            error instanceof Error ? error.message : 'No se pudo cargar el analisis fundamental.',
          )
        }
      } finally {
        if (!ignore) {
          setIsLoadingFundamentals(false)
        }
      }
    }

    void loadFundamentals()

    return () => {
      ignore = true
    }
  }, [isFundamentalModalOpen, accionSeleccionada?.simbolo])

  useEffect(() => {
    if (!accionSeleccionada?.simbolo) {
      return
    }

    // Si la seleccion vino de la carga inicial, los datos ya son frescos:
    // saltar el fetch para no consumir cuota de Alpha Vantage innecesariamente.
    if (skipNextAssetRefresh.current) {
      skipNextAssetRefresh.current = false
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

    void refreshSelectedAsset()

    return () => {
      ignore = true
    }
  }, [accionSeleccionada?.simbolo])

  const chartData = useMemo(
    () => buildChartDataFromHistory(accionSeleccionada ?? fallbackChartStock, priceHistory),
    [accionSeleccionada, priceHistory],
  )

  const historyRange = useMemo(
    () => getPriceRange(priceHistory?.puntos ?? []),
    [priceHistory],
  )

  const chartDescription = useMemo(() => {
    if (isLoadingPriceHistory) {
      return `Cargando historial de ${accionSeleccionada?.simbolo ?? 'la accion seleccionada'}`
    }

    if ((priceHistory?.puntos.length ?? 0) > 1) {
      return `Serie historica real de ${accionSeleccionada?.simbolo ?? '---'} con ${priceHistory?.puntos.length ?? 0} registros`
    }

    return `Historial real de ${accionSeleccionada?.simbolo ?? '---'} disponible en la base de datos`
  }, [accionSeleccionada?.simbolo, isLoadingPriceHistory, priceHistory])

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

    const requiresTriggerPrice = tipoOrden === 'limite' || tipoOrden === 'stop'
    const normalizedPrecioCondicion = Number(precioCondicion)

    if (
      requiresTriggerPrice
      && (!Number.isFinite(normalizedPrecioCondicion) || normalizedPrecioCondicion <= 0)
    ) {
      setOrderMessage(null)
      setOrderError(`Ingresa un precio ${tipoOrden === 'stop' ? 'stop' : 'limite'} valido mayor a cero.`)
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
        tipoOrden,
        precioLimite: requiresTriggerPrice ? normalizedPrecioCondicion : undefined,
      }, session?.accessToken)

      setOrderMessage(response.mensaje)
      setCantidad('')
      setTipoOrden('mercado')
      setPrecioCondicion('')
      await refreshMarket(accionSeleccionada.id)
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'No se pudo crear la orden.')
    } finally {
      setIsSubmittingOrder(false)
    }
  }

  const handleOpenFundamentals = () => {
    setFundamentals(null)
    setFundamentalsError(null)
    setIsFundamentalModalOpen(true)
  }

  return (
    <div className='space-y-5 p-4 sm:space-y-6'>
      <MediumTitle text={'Invertir'} className='leading-none' />

      <Carrusel
        titulo='Mas Negociadas'
        acciones={acciones}
        isLoading={isLoading}
        sourceLabel={marketStatus?.mensaje ?? 'Datos obtenidos desde el backend'}
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
              text={`Fuente: ${formatMarketSource(marketStatus.fuente)} · Zona: ${marketStatus.zonaHorariaMercado}`}
              className='text-[var(--bg-muted)]'
            />
          </div>
          <SubTextoMini
            text={marketStatus.mensaje}
            className='mt-1 text-[var(--bg-muted)]'
          />
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
            descripcion={chartDescription}
            valorActual={accionSeleccionada?.precio ?? '$0.00'}
            variacion={accionSeleccionada ? `${accionSeleccionada.variacion >= 0 ? '+' : ''}${accionSeleccionada.variacion.toFixed(2)}% hoy` : 'Sin datos'}
            labels={chartData.labels}
            series={chartData.series}
            xAxisLabel='Fecha'
            yAxisLabel='Precio'
            valueFormatter={(value) => formatPrice(value, priceHistory?.moneda ?? 'USD')}
          />

          {historyRange ? (
            <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              <div className='rounded-[24px] border border-[var(--bg-border)] bg-[#11161C] p-4'>
                <SubTextoMini text='Registros graficados' className='text-[var(--bg-muted)]' />
                <SubTexto text={`${priceHistory?.puntos.length ?? 0}`} className='mt-1 font-semibold text-[var(--bg-text)]' />
              </div>
              <div className='rounded-[24px] border border-[var(--bg-border)] bg-[#11161C] p-4'>
                <SubTextoMini text='Minimo del periodo' className='text-[var(--bg-muted)]' />
                <SubTexto text={formatPrice(historyRange.minimo, priceHistory?.moneda ?? 'USD')} className='mt-1 font-semibold text-[var(--bg-text)]' />
              </div>
              <div className='rounded-[24px] border border-[var(--bg-border)] bg-[#11161C] p-4'>
                <SubTextoMini text='Maximo del periodo' className='text-[var(--bg-muted)]' />
                <SubTexto text={formatPrice(historyRange.maximo, priceHistory?.moneda ?? 'USD')} className='mt-1 font-semibold text-[var(--bg-text)]' />
              </div>
              <div className='rounded-[24px] border border-[var(--bg-border)] bg-[#11161C] p-4'>
                <SubTextoMini text='Ultimo cierre' className='text-[var(--bg-muted)]' />
                <SubTexto
                  text={formatPrice(priceHistory?.puntos.at(-1)?.cierre ?? parsePrecio(accionSeleccionada?.precio ?? '$0.00'), priceHistory?.moneda ?? 'USD')}
                  className='mt-1 font-semibold text-[var(--bg-text)]'
                />
              </div>
            </div>
          ) : null}

          <div className='rounded-[28px] border border-[var(--bg-border)] bg-[linear-gradient(135deg,#10141A_0%,#131D18_100%)] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)]'>
            <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
              <div className='space-y-2'>
                <SubTitle text='Analisis fundamental' className='text-[var(--bg-text)]' />
                <SubTexto
                  text={`Explora valoracion, rentabilidad, crecimiento y dividendos de ${accionSeleccionada?.simbolo ?? 'la accion seleccionada'}.`}
                  className='text-[var(--bg-muted)]'
                />
                <SubTextoMini
                  text='Los indicadores se consultan solo cuando abres el modal.'
                  className='text-[var(--bg-muted)]'
                />
              </div>

              <button
                type='button'
                onClick={handleOpenFundamentals}
                disabled={!accionSeleccionada}
                className='inline-flex h-12 items-center justify-center rounded-2xl border border-[#244E35] bg-[#1A2A20] px-5 text-sm font-semibold text-[#C4F2D3] transition hover:bg-[#203324] disabled:cursor-not-allowed disabled:opacity-60'
              >
                Ver indicadores fundamentales
              </button>
            </div>
          </div>

          <Cardcomprar
            nombreAccion={accionSeleccionada?.nombre}
            simbolo={accionSeleccionada?.simbolo}
            precio={accionSeleccionada?.precio}
            variacion={accionSeleccionada?.variacion}
            cantidad={cantidad}
            onCantidadChange={setCantidad}
            tipoOperacion={tipoOperacion}
            onTipoOperacionChange={setTipoOperacion}
            tipoOrden={tipoOrden}
            onTipoOrdenChange={setTipoOrden}
            precioCondicion={precioCondicion}
            onPrecioCondicionChange={setPrecioCondicion}
            onSubmit={handleSubmitOrder}
            isSubmitting={isSubmittingOrder}
            isRefreshingPrice={isRefreshingSelectedPrice}
            mensaje={orderMessage}
            error={orderError}
          />
        </div>
      </section>

      <ModalAnalisisFundamental
        isOpen={isFundamentalModalOpen}
        simbolo={accionSeleccionada?.simbolo}
        isLoading={isLoadingFundamentals}
        error={fundamentalsError}
        data={fundamentals}
        onClose={() => setIsFundamentalModalOpen(false)}
      />
    </div>
  )
}

export default Index
