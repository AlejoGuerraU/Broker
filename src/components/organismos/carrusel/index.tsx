'use client'

import React, { useEffect, useState } from 'react'
import { SubTitle, SubTexto, SubTextoMini } from '@/components/atoms/heroTitles'
import Icon from '@/components/atoms/icon'
import { getMostActiveStocks } from '@/services/market'
import type { AccionMercadoItem } from '@/types/market'

interface CarruselProps {
  titulo?: string
  acciones?: AccionMercadoItem[]
}

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

const getVisibleCards = (width: number) => {
  if (width >= 1280) return 4
  if (width >= 1024) return 3
  if (width >= 640) return 2
  return 1
}

const Index = ({
  titulo = 'Acciones mas negociadas',
  acciones = accionesPorDefecto,
}: CarruselProps) => {
  const [items, setItems] = useState(acciones)
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleCards, setVisibleCards] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setItems(acciones)
  }, [acciones])

  useEffect(() => {
    if (acciones.length > 0) {
      setIsLoading(false)
      return
    }

    let ignore = false

    const loadMostActive = async () => {
      try {
        const marketItems = await getMostActiveStocks()

        if (!ignore) {
          setItems(marketItems)
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
  }, [acciones])

  useEffect(() => {
    const updateVisibleCards = () => {
      setVisibleCards(getVisibleCards(window.innerWidth))
    }

    updateVisibleCards()
    window.addEventListener('resize', updateVisibleCards)

    return () => window.removeEventListener('resize', updateVisibleCards)
  }, [])

  const maxIndex = Math.max(items.length - visibleCards, 0)
  const currentIndex = Math.min(activeIndex, maxIndex)
  const cardWidth = 100 / visibleCards

  const handlePrev = () => {
    setActiveIndex(Math.max(currentIndex - 1, 0))
  }

  const handleNext = () => {
    setActiveIndex(Math.min(currentIndex + 1, maxIndex))
  }

  return (
    <section className='space-y-5 rounded-[28px] border border-[var(--bg-border)] bg-[#0F1318] p-5 md:p-6'>
      <div className='flex items-center justify-between gap-4'>
        <div className='space-y-1'>
          <SubTitle text={titulo} className='text-[var(--bg-text)]' />
          <SubTextoMini
            text={isLoading ? 'Cargando mercado...' : 'Datos obtenidos desde Alpha Vantage'}
            className='text-[var(--bg-muted)]'
          />
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className='flex h-10 w-10 items-center justify-center rounded-full border border-[var(--bg-border)] bg-[#171B21] text-[var(--bg-text)] transition disabled:cursor-not-allowed disabled:opacity-35'
          >
            <Icon name='mdi:chevron-left' width={22} height={22} />
          </button>
          <button
            type='button'
            onClick={handleNext}
            disabled={currentIndex === maxIndex}
            className='flex h-10 w-10 items-center justify-center rounded-full border border-[var(--bg-border)] bg-[#171B21] text-[var(--bg-text)] transition disabled:cursor-not-allowed disabled:opacity-35'
          >
            <Icon name='mdi:chevron-right' width={22} height={22} />
          </button>
        </div>
      </div>

      <div className='overflow-hidden'>
        <div
          className='flex transition-transform duration-500 ease-out'
          style={{ transform: `translateX(-${currentIndex * cardWidth}%)` }}
        >
          {items.map((accion) => {
            const positiva = accion.variacion >= 0

            return (
              <article
                key={accion.id}
                className='shrink-0 px-2'
                style={{ flexBasis: `${cardWidth}%` }}
              >
                <div className='h-full rounded-3xl border border-[var(--bg-border)] bg-[#171B21] p-4'>
                  <div className='mb-6 flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold ${accion.logoClase}`}
                      >
                        {accion.logoTexto}
                      </div>

                      <div>
                        <SubTexto text={accion.nombre} className='font-semibold text-[var(--bg-text)]' />
                        <SubTextoMini
                          text={accion.volumen ? `${accion.simbolo} - Vol. ${accion.volumen}` : accion.simbolo}
                          className='tracking-[0.18em] text-[var(--bg-muted)]'
                        />
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        positiva ? 'bg-[#1D2C24] text-[#B8F3CB]' : 'bg-[#3B1D24] text-[#FF8A8A]'
                      }`}
                    >
                      {positiva ? '+' : ''}
                      {accion.variacion.toFixed(2)}%
                    </span>
                  </div>

                  <div className='space-y-1'>
                    <SubTextoMini
                      text='Precio actual'
                      className='uppercase tracking-[0.18em] text-[var(--bg-muted)]'
                    />
                    <p className='text-[30px] font-semibold leading-none text-[var(--bg-text)]'>
                      {accion.precio}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className='flex justify-center gap-2'>
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            type='button'
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir al grupo ${index + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              index === currentIndex ? 'w-8 bg-[var(--bg-text)]' : 'w-2.5 bg-[#303641]'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default Index
