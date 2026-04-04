import React, { useEffect, useMemo, useState } from 'react'
import Cardmetrica from '@/components/moleculas/cardMetrica'
import { MediumTitle } from '@/components/atoms/heroTitles'
import ModalAccionPortafolio from '@/components/organismos/modalAccionPortafolio'
import TableHistorial from '@/components/organismos/tableHistorial'
import TablePortfolio from '@/components/organismos/tablePortfolio'
import type { AccionPortafolioItem, OrdenHistorialItem } from '@/types/portafolio'
import Button from '@/components/atoms/button'
import { getPortfolioData } from '@/services/portafolio'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

type VistaTabla = 'acciones' | 'ordenes'

const Index = () => {
  const [acciones, setAcciones] = useState<AccionPortafolioItem[]>([])
  const [ordenes, setOrdenes] = useState<OrdenHistorialItem[]>([])
  const [accionSeleccionada, setAccionSeleccionada] = useState<AccionPortafolioItem | null>(null)
  const [vistaActiva, setVistaActiva] = useState<VistaTabla>('acciones')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPortfolio = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getPortfolioData()

        if (!isMounted) {
          return
        }

        setAcciones(data.acciones)
        setOrdenes(data.ordenes)
      } catch {
        if (!isMounted) {
          return
        }

        setError('No se pudo cargar la informacion del portafolio.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPortfolio()

    return () => {
      isMounted = false
    }
  }, [])

  const resumen = useMemo(() => {
    const valorActual = acciones.reduce((total, accion) => total + accion.cantidad * accion.precioActual, 0)
    const inversionTotal = acciones.reduce((total, accion) => total + accion.cantidad * accion.precioPromedio, 0)
    const rendimiento = inversionTotal === 0 ? 0 : ((valorActual - inversionTotal) / inversionTotal) * 100
    const variacionDiariaPromedio =
      acciones.length === 0
        ? 0
        : acciones.reduce((total, accion) => total + accion.variacionDiaria, 0) / acciones.length

    return {
      valorActual,
      rendimiento,
      variacionDiariaPromedio,
    }
  }, [acciones])

  return (
    <main className='flex flex-1 flex-col gap-5 p-4 sm:gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <MediumTitle text='Portafolio' className='leading-none' />
        <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-row'>
          <Button
            label='Acciones'
            onClick={() => setVistaActiva('acciones')}
            iconName='nimbus:stats'
            color={vistaActiva === 'acciones' ? '#25B161' : '#272C35'}
            textColor='#E6EBF0'
            className='w-full sm:w-auto'
          />
          <Button
            label='Ordenes'
            onClick={() => setVistaActiva('ordenes')}
            iconName='solar:clipboard-list-linear'
            color={vistaActiva === 'ordenes' ? '#25B161' : '#272C35'}
            textColor='#E6EBF0'
            className='w-full sm:w-auto'
          />
        </div>
      </div>

      <div className='grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4'>
        <Cardmetrica
          titulo='Valor actual'
          iconName='streamline:baggage-remix'
          textMetrica={formatCurrency(resumen.valorActual)}
          color='#25B161'
        />
        <Cardmetrica
          titulo='Rendimiento'
          iconName='streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow'
          textMetrica={formatPercent(resumen.rendimiento)}
          color={resumen.rendimiento >= 0 ? '#25B161' : '#FF5A57'}
        />
        <Cardmetrica
          titulo='Var. Diaria'
          iconName='solar:chart-2-linear'
          textMetrica={formatPercent(resumen.variacionDiariaPromedio)}
          color={resumen.variacionDiariaPromedio >= 0 ? '#25B161' : '#FF5A57'}
        />
      </div>

      {error ? (
        <div className='rounded-2xl border border-[#4A2323] bg-[#2A1717] px-4 py-3 text-sm text-[#FFB3B1]'>
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className='rounded-[24px] border border-[var(--bg-border)] bg-[var(--card-color)] px-5 py-12 text-center text-sm text-[var(--bg-muted)]'>
          Cargando informacion del portafolio...
        </div>
      ) : vistaActiva === 'acciones' ? (
        <TablePortfolio acciones={acciones} onSelect={setAccionSeleccionada} />
      ) : (
        <TableHistorial ordenes={ordenes} />
      )}
      <ModalAccionPortafolio
        isOpen={!isLoading && vistaActiva === 'acciones' && Boolean(accionSeleccionada)}
        accion={accionSeleccionada}
        onClose={() => setAccionSeleccionada(null)}
      />
    </main>
  )
}

export default Index
