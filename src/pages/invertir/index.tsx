'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { MediumTitle, SubTexto, SubTextoMini, SubTitle } from '@/components/atoms/heroTitles'
import Input from '@/components/atoms/input'
import Cardcomprar from '@/components/moleculas/cardComprar'
import CardAcciones from '@/components/moleculas/cardAcciones'
import Carrusel from '@/components/organismos/carrusel'
import { getMostActiveStocks } from '@/services/market'
import type { AccionMercadoItem } from '@/types/market'

const accionesPorDefecto: AccionMercadoItem[] = [
  {
    id: 1,
    nombre: 'Apple',
    simbolo: 'AAPL',
    precio: '$214.32',
    variacion: 1.84,
    volumen: '189.2M',
    logoTexto: 'A',
    logoClase: 'bg-[#E8EEF9] text-[#1C2430]',
  },
  {
    id: 2,
    nombre: 'NVIDIA',
    simbolo: 'NVDA',
    precio: '$942.67',
    variacion: 3.12,
    volumen: '244.8M',
    logoTexto: 'N',
    logoClase: 'bg-[#DFF7D8] text-[#1F5F27]',
  },
  {
    id: 3,
    nombre: 'Tesla',
    simbolo: 'TSLA',
    precio: '$176.45',
    variacion: -2.41,
    volumen: '132.4M',
    logoTexto: 'T',
    logoClase: 'bg-[#FFE3E2] text-[#8A1F1D]',
  },
  {
    id: 4,
    nombre: 'Amazon',
    simbolo: 'AMZN',
    precio: '$182.90',
    variacion: 0.96,
    volumen: '71.9M',
    logoTexto: 'AM',
    logoClase: 'bg-[#FFF1D6] text-[#8A5B07]',
  },
  {
    id: 5,
    nombre: 'Microsoft',
    simbolo: 'MSFT',
    precio: '$428.11',
    variacion: 1.27,
    volumen: '39.5M',
    logoTexto: 'M',
    logoClase: 'bg-[#DDEBFF] text-[#12438B]',
  },
  {
    id: 6,
    nombre: 'Meta',
    simbolo: 'META',
    precio: '$503.74',
    variacion: -0.68,
    volumen: '26.1M',
    logoTexto: 'ME',
    logoClase: 'bg-[#E7E0FF] text-[#4D2CA3]',
  },
]

const chartLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const parsePrecio = (precio: string) => Number(precio.replace('$', '').replace(/,/g, ''))

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
  const [acciones, setAcciones] = useState<AccionMercadoItem[]>(accionesPorDefecto)
  const [selectedId, setSelectedId] = useState<number>(accionesPorDefecto[0].id)
  const [busqueda, setBusqueda] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    const loadMostActive = async () => {
      try {
        const marketItems = await getMostActiveStocks()

        if (!ignore && marketItems.length > 0) {
          setAcciones(marketItems)
          setSelectedId((currentSelectedId) => {
            const stillExists = marketItems.some((accion) => accion.id === currentSelectedId)
            return stillExists ? currentSelectedId : marketItems[0].id
          })
        }
      } catch {
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
    acciones.find((accion) => accion.id === selectedId) ?? acciones[0] ?? accionesPorDefecto[0]

  const seriesSeleccionadas = useMemo(
    () => buildSeriesFromStock(accionSeleccionada),
    [accionSeleccionada],
  )

  return (
    <div className='space-y-5 p-4 sm:space-y-6'>
      <MediumTitle text={'Invertir'} className='leading-none' />

      <Carrusel titulo='Mas Negociadas' acciones={acciones} />

      <div className='flex w-full gap-2 md:w-3/5'>
        <Input
          type={'text'}
          placeholder={'Buscar inversion...'}
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
      </div>

      <section className='grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-6'>
        <aside className='rounded-[28px] border border-[var(--bg-border)] bg-[#0F1318] p-4 sm:p-5 md:p-6'>
          <div className='mb-5 space-y-1'>
            <SubTitle text='Listado de acciones' className='text-[var(--bg-text)]' />
            <SubTextoMini
              text={isLoading ? 'Cargando mercado...' : 'Selecciona una accion de la lista'}
              className='text-[var(--bg-muted)]'
            />
          </div>

          <div className='space-y-2'>
            {accionesFiltradas.length > 0 ? (
              accionesFiltradas.map((accion) => {
                const activa = accion.id === accionSeleccionada.id
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
                <SubTexto text='No hay acciones que coincidan con tu busqueda.' className='text-[var(--bg-muted)]' />
              </div>
            )}
          </div>
        </aside>

        <div className='space-y-6'>
          <CardAcciones
            titulo={`Movimiento de ${accionSeleccionada.nombre}`}
            descripcion={`Comparativa semanal de ${accionSeleccionada.simbolo} frente al portafolio`}
            valorActual={accionSeleccionada.precio}
            variacion={`${accionSeleccionada.variacion >= 0 ? '+' : ''}${accionSeleccionada.variacion.toFixed(2)}% hoy`}
            labels={chartLabels}
            series={seriesSeleccionadas}
            xAxisLabel='Periodo'
            yAxisLabel='Precio'
            showLegend
          />

          <Cardcomprar
            nombreAccion={accionSeleccionada.nombre}
            simbolo={accionSeleccionada.simbolo}
            precio={accionSeleccionada.precio}
            variacion={accionSeleccionada.variacion}
          />
        </div>
      </section>
    </div>
  )
}

export default Index
