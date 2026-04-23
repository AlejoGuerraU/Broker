import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import Cardmetrica from '@/components/moleculas/cardMetrica'
import { MediumTitle } from '@/components/atoms/heroTitles'
import ModalAccionPortafolio from '@/components/organismos/modalAccionPortafolio'
import ModalGestionOrden from '@/components/organismos/modalGestionOrden'
import TableHistorial from '@/components/organismos/tableHistorial'
import TablePortfolio from '@/components/organismos/tablePortfolio'
import type {
  AccionPortafolioItem,
  OrdenHistorialItem,
  ResumenCuentaBroker,
} from '@/types/portafolio'
import Button from '@/components/atoms/button'
import { cancelPortfolioOrder, getPortfolioData, updatePortfolioOrder } from '@/services/portafolio'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

type VistaTabla = 'acciones' | 'ordenes'

const Index = () => {
  const { data: session, status } = useSession()
  const [acciones, setAcciones] = useState<AccionPortafolioItem[]>([])
  const [ordenes, setOrdenes] = useState<OrdenHistorialItem[]>([])
  const [resumenCuenta, setResumenCuenta] = useState<ResumenCuentaBroker>({
    saldoDisponible: 0,
    saldoCongelado: 0,
  })
  const [accionSeleccionada, setAccionSeleccionada] = useState<AccionPortafolioItem | null>(null)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenHistorialItem | null>(null)
  const [vistaActiva, setVistaActiva] = useState<VistaTabla>('acciones')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderActionMessage, setOrderActionMessage] = useState<string | null>(null)
  const [orderActionError, setOrderActionError] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadPortfolio = async () => {
      if (status === 'loading') {
        return
      }

      if (status !== 'authenticated') {
        if (isMounted) {
          setIsLoading(false)
        }
        return
      }

      if (!session?.accessToken) {
        if (isMounted) {
          setError(session?.error || 'Tu sesion con Google existe, pero el backend no pudo validarla.')
          setIsLoading(false)
        }
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const data = await getPortfolioData(session.accessToken)

        if (!isMounted) {
          return
        }

        setAcciones(data.acciones)
        setOrdenes(data.ordenes)
        setResumenCuenta(data.resumenCuenta)
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
  }, [session?.accessToken, session?.error, status])

  const refreshPortfolio = async () => {
    if (!session?.accessToken) {
      throw new Error('No hay sesion valida para consultar el portafolio.')
    }

    const data = await getPortfolioData(session.accessToken)
    setAcciones(data.acciones)
    setOrdenes(data.ordenes)
    setResumenCuenta(data.resumenCuenta)
  }

  const handleOpenOrderModal = (orden: OrdenHistorialItem) => {
    setOrderActionError(null)
    setOrderActionMessage(null)
    setOrdenSeleccionada(orden)
  }

  const handleCloseOrderModal = () => {
    if (pendingOrderId !== null) {
      return
    }

    setOrdenSeleccionada(null)
    setOrderActionError(null)
  }

  const handleSubmitEditOrder = async (payload: { cantidad: number; precioLimite?: number }) => {
    if (!ordenSeleccionada || !session?.accessToken) {
      return
    }

    try {
      setPendingOrderId(ordenSeleccionada.id)
      setOrderActionError(null)
      const response = await updatePortfolioOrder(ordenSeleccionada.id, payload, session.accessToken)
      setOrderActionMessage(response.mensaje)
      setOrdenSeleccionada(null)
      await refreshPortfolio()
    } catch (editError) {
      setOrderActionError(editError instanceof Error ? editError.message : 'No se pudo modificar la orden.')
    } finally {
      setPendingOrderId(null)
    }
  }

  const handleCancelOrder = async (orden: OrdenHistorialItem) => {
    if (!session?.accessToken) {
      return
    }

    const confirmed = window.confirm(`¿Cancelar la orden pendiente de ${orden.tipo} para ${orden.activo}?`)
    if (!confirmed) {
      return
    }

    try {
      setPendingOrderId(orden.id)
      setOrderActionError(null)
      setOrderActionMessage(null)
      const response = await cancelPortfolioOrder(orden.id, session.accessToken)
      if (ordenSeleccionada?.id === orden.id) {
        setOrdenSeleccionada(null)
      }
      setOrderActionMessage(response.mensaje)
      await refreshPortfolio()
    } catch (cancelError) {
      setOrderActionError(cancelError instanceof Error ? cancelError.message : 'No se pudo cancelar la orden.')
    } finally {
      setPendingOrderId(null)
    }
  }

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

  if (status === 'loading') {
    return (
      <div className='flex h-[50vh] items-center justify-center p-4'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-color)] border-t-transparent' />
      </div>
    )
  }

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
          titulo='Saldo disponible'
          iconName='solar:wallet-money-linear'
          textMetrica={formatCurrency(resumenCuenta.saldoDisponible)}
          color='#4DA3FF'
        />
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

      {orderActionMessage ? (
        <div className='rounded-2xl border border-[#244E35] bg-[#13241A] px-4 py-3 text-sm text-[#B8F3CB]'>
          {orderActionMessage}
        </div>
      ) : null}

      {orderActionError ? (
        <div className='rounded-2xl border border-[#4A2323] bg-[#2A1717] px-4 py-3 text-sm text-[#FFB3B1]'>
          {orderActionError}
        </div>
      ) : null}

      {isLoading ? (
        <div className='rounded-[24px] border border-[var(--bg-border)] bg-[var(--card-color)] px-5 py-12 text-center text-sm text-[var(--bg-muted)]'>
          Cargando informacion del portafolio...
        </div>
      ) : vistaActiva === 'acciones' ? (
        <TablePortfolio acciones={acciones} onSelect={setAccionSeleccionada} />
      ) : (
        <TableHistorial
          ordenes={ordenes}
          pendingActionId={pendingOrderId}
          onSelect={handleOpenOrderModal}
        />
      )}
      <ModalAccionPortafolio
        isOpen={!isLoading && vistaActiva === 'acciones' && Boolean(accionSeleccionada)}
        accion={accionSeleccionada}
        onClose={() => setAccionSeleccionada(null)}
      />
      <ModalGestionOrden
        key={ordenSeleccionada?.id ?? 'sin-orden'}
        isOpen={vistaActiva === 'ordenes' && Boolean(ordenSeleccionada)}
        orden={ordenSeleccionada}
        onClose={handleCloseOrderModal}
        onSubmitEdit={handleSubmitEditOrder}
        onCancelOrder={handleCancelOrder}
        error={orderActionError}
        isSubmitting={pendingOrderId === ordenSeleccionada?.id}
      />
    </main>
  )
}

export default Index
