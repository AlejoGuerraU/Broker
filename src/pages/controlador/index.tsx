import React, { useEffect, useMemo, useState } from 'react'
import CardMetrica from '@/components/moleculas/cardMetrica'
import CardAcciones from '@/components/moleculas/cardAcciones'
import { MediumTitle } from '@/components/atoms/heroTitles'
import TableMoney from '@/components/organismos/tableMoney'
import Button from '@/components/atoms/button'
import ModalMovimiento from '@/components/organismos/modalMovimiento'
import type { MovimientoItem } from '@/types/movimiento'
import { createMovimiento, deleteMovimiento, getMovimientos, updateMovimiento } from '@/services/movimiento'

const formatMonto = (monto: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(monto)

const formatFechaCorta = (fecha: string) =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(fecha))

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [movimientos, setMovimientos] = useState<MovimientoItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movimientoEnEdicion, setMovimientoEnEdicion] = useState<MovimientoItem | null>(null)
  const [modalVersion, setModalVersion] = useState(0)

  const resumen = useMemo(() => {
    const ingresos = movimientos
      .filter((movimiento) => movimiento.tipo === 'ingreso')
      .reduce((total, movimiento) => total + movimiento.monto, 0)

    const egresos = movimientos
      .filter((movimiento) => movimiento.tipo === 'egreso')
      .reduce((total, movimiento) => total + movimiento.monto, 0)

    return {
      ingresos,
      egresos,
      balance: ingresos - egresos,
    }
  }, [movimientos])

  const graficaControl = useMemo(() => {
    const movimientosOrdenados = [...movimientos].sort(
      (movimientoA, movimientoB) =>
        new Date(movimientoA.fecha).getTime() - new Date(movimientoB.fecha).getTime(),
    )

    let balanceAcumulado = 0
    let ingresosAcumulados = 0
    let egresosAcumulados = 0

    const labels = movimientosOrdenados.map((movimiento) => formatFechaCorta(movimiento.fecha))
    const balanceSerie = movimientosOrdenados.map((movimiento) => {
      balanceAcumulado += movimiento.tipo === 'ingreso' ? movimiento.monto : -movimiento.monto
      return Number(balanceAcumulado.toFixed(2))
    })

    const ingresosSerie = movimientosOrdenados.map((movimiento) => {
      if (movimiento.tipo === 'ingreso') {
        ingresosAcumulados += movimiento.monto
      }

      return Number(ingresosAcumulados.toFixed(2))
    })

    const egresosSerie = movimientosOrdenados.map((movimiento) => {
      if (movimiento.tipo === 'egreso') {
        egresosAcumulados += movimiento.monto
      }

      return Number(egresosAcumulados.toFixed(2))
    })

    return {
      labels,
      series: [
        {
          label: 'Balance',
          values: balanceSerie,
          color: '#25B161',
        },
        {
          label: 'Ingresos',
          values: ingresosSerie,
          color: '#4DA3FF',
          fill: false,
        },
        {
          label: 'Egresos',
          values: egresosSerie,
          color: '#FF6B6B',
          fill: false,
        },
      ],
    }
  }, [movimientos])

  useEffect(() => {
    let isMounted = true

    const loadMovimientos = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getMovimientos()

        if (!isMounted) {
          return
        }

        setMovimientos(data)
      } catch {
        if (!isMounted) {
          return
        }

        setError('No se pudo cargar la informacion de movimientos.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMovimientos()

    return () => {
      isMounted = false
    }
  }, [])

  const handleOpenCreateModal = () => {
    setMovimientoEnEdicion(null)
    setModalVersion((currentVersion) => currentVersion + 1)
    setIsModalOpen(true)
  }

  const handleEditMovimiento = (movimiento: MovimientoItem) => {
    setMovimientoEnEdicion(movimiento)
    setModalVersion((currentVersion) => currentVersion + 1)
    setIsModalOpen(true)
  }

  const handleDeleteMovimiento = async (movimiento: MovimientoItem) => {
    const shouldDelete = window.confirm(`¿Deseas eliminar el movimiento "${movimiento.descripcion}"?`)

    if (!shouldDelete) {
      return
    }

    try {
      setError(null)
      await deleteMovimiento(movimiento.id)
      setMovimientos((currentMovimientos) =>
        currentMovimientos.filter((currentMovimiento) => currentMovimiento.id !== movimiento.id),
      )
    } catch {
      setError('No se pudo eliminar el movimiento.')
    }
  }

  const handleSaveMovimiento = async (movimiento: Omit<MovimientoItem, 'id'>) => {
    try {
      setError(null)

      if (movimientoEnEdicion) {
        const movimientoActualizado = await updateMovimiento(movimientoEnEdicion.id, movimiento)

        setMovimientos((currentMovimientos) =>
          currentMovimientos.map((currentMovimiento) =>
            currentMovimiento.id === movimientoEnEdicion.id ? movimientoActualizado : currentMovimiento,
          ),
        )
      } else {
        const nuevoMovimiento = await createMovimiento(movimiento)
        setMovimientos((currentMovimientos) => [nuevoMovimiento, ...currentMovimientos])
      }

      setMovimientoEnEdicion(null)
      setIsModalOpen(false)
    } catch {
      setError(
        movimientoEnEdicion
          ? 'No se pudo actualizar el movimiento.'
          : 'No se pudo guardar el movimiento.',
      )
      throw new Error('No se pudo guardar el movimiento.')
    }
  }

  const handleCloseModal = () => {
    setMovimientoEnEdicion(null)
    setIsModalOpen(false)
  }

  return (
    <main className='flex flex-1 flex-col gap-5 p-4 sm:gap-6'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <MediumTitle text='Control de Dinero' className='leading-none' />
        <Button
          titulo={'Agregar Movimiento'}
          onClick={handleOpenCreateModal}
          color='#25B161'
          className='w-full text-white sm:w-auto'
        />
      </div>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4'>
        <CardMetrica titulo={'Balance'} iconName={'lucide:wallet'} textMetrica={formatMonto(resumen.balance)} iconMetrica={''} color={'#25B161'} />
        <CardMetrica titulo={'Ingresos'} iconName={'streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow'} textMetrica={formatMonto(resumen.ingresos)} iconMetrica={''} color={'#25B161'} />
        <CardMetrica titulo={'Egresos'} iconName={'streamline:money-graph-arrow-decrease-down-stats-graph-descend-right-arrow'} textMetrica={formatMonto(resumen.egresos)} iconMetrica={''} color={'#FF0000'} />
      </div>

      {error ? (
        <div className='rounded-2xl border border-[#4A2323] bg-[#2A1717] px-4 py-3 text-sm text-[#FFB3B1]'>
          {error}
        </div>
      ) : null}

      {!isLoading && graficaControl.labels.length > 0 ? (
        <CardAcciones
          titulo='Movimiento del control'
          descripcion='Evolucion acumulada de tus movimientos'
          valorActual={formatMonto(resumen.balance)}
          variacion={`${movimientos.length} movimientos registrados`}
          labels={graficaControl.labels}
          series={graficaControl.series}
          xAxisLabel='Fecha'
          yAxisLabel='Monto'
          showLegend
        />
      ) : null}

      {isLoading ? (
        <div className='rounded-[24px] border border-[var(--bg-border)] bg-[var(--card-color)] px-5 py-12 text-center text-sm text-[var(--bg-muted)]'>
          Cargando movimientos...
        </div>
      ) : (
        <TableMoney
          movimientos={movimientos}
          onEdit={handleEditMovimiento}
          onDelete={handleDeleteMovimiento}
        />
      )}
      <ModalMovimiento
        key={`${movimientoEnEdicion?.id ?? 'new'}-${modalVersion}`}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMovimiento}
        movimiento={movimientoEnEdicion}
      />
    </main>
  )
}

export default Index
