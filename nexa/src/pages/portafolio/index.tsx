import React, { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import Cardmetrica from '@/components/moleculas/cardMetrica'
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
import Icon from '@/components/atoms/icon'
import { cancelPortfolioOrder, getPortfolioData, resetDemoPortfolio, updatePortfolioOrder } from '@/services/portafolio'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value)

const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

const formatLastReset = (value: string | null) => {
  if (!value) {
    return 'Sin reinicios registrados'
  }

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

type VistaTabla = 'acciones' | 'ordenes'

const Index = () => {
  const { data: session, status } = useSession()
  const [acciones, setAcciones] = useState<AccionPortafolioItem[]>([])
  const [ordenes, setOrdenes] = useState<OrdenHistorialItem[]>([])
  const [resumenCuenta, setResumenCuenta] = useState<ResumenCuentaBroker>({
    saldoDisponible: 0,
    saldoCongelado: 0,
    fechaUltimoReinicio: null,
  })
  const [accionSeleccionada, setAccionSeleccionada] = useState<AccionPortafolioItem | null>(null)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenHistorialItem | null>(null)
  const [vistaActiva, setVistaActiva] = useState<VistaTabla>('acciones')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderActionMessage, setOrderActionMessage] = useState<string | null>(null)
  const [orderActionError, setOrderActionError] = useState<string | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null)
  const [isResettingDemo, setIsResettingDemo] = useState(false)

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

  const handleResetDemo = async () => {
    if (!session?.accessToken || isResettingDemo) {
      return
    }

    const confirmed = window.confirm(
      '¿Reiniciar la cuenta demo? Se restaurará el saldo inicial, se eliminarán las posiciones abiertas y también se borrará el historial de órdenes.',
    )
    if (!confirmed) {
      return
    }

    try {
      setIsResettingDemo(true)
      setOrderActionError(null)
      setOrderActionMessage(null)
      setAccionSeleccionada(null)
      setOrdenSeleccionada(null)
      const response = await resetDemoPortfolio(session.accessToken)
      setOrderActionMessage(response.message)
      await refreshPortfolio()
    } catch (resetError) {
      setOrderActionError(resetError instanceof Error ? resetError.message : 'No se pudo reiniciar la demo.')
    } finally {
      setIsResettingDemo(false)
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
      <div className="relative overflow-hidden rounded-[24px] border border-[#23282F] bg-[#15181E] p-6 sm:p-8 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        {/* Ambient light glow orb */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#25B161]/8 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25B161]/15 text-[#25B161]">
                <Icon name="solar:wallet-bold-duotone" width={22} height={22} className="text-[#25B161]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E6EBF0]">
                Portafolio de Inversión
              </h1>
            </div>
            <p className="text-sm text-[#75808F] flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#25B161] animate-pulse" />
              Último reinicio demo: <span className="font-semibold text-[#8EA2BF]">{formatLastReset(resumenCuenta.fechaUltimoReinicio)}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row items-center">
            <Button
              label={isResettingDemo ? 'Reiniciando...' : 'Reiniciar demo'}
              onClick={() => { void handleResetDemo() }}
              iconName='solar:restart-linear'
              color='className'
              textColor='#F9E8EB'
              className='col-span-2 w-full sm:col-span-1 sm:w-auto bg-gradient-to-r from-[#8B2635] to-[#a83244] border border-red-500/20 hover:border-red-500/40 shadow-lg shadow-red-950/20 text-xs sm:text-sm py-2.5 px-4'
              disabled={isLoading || isResettingDemo || status !== 'authenticated'}
            />
            <Button
              label='Acciones'
              onClick={() => setVistaActiva('acciones')}
              iconName='nimbus:stats'
              color='className'
              textColor={vistaActiva === 'acciones' ? '#ffffff' : '#8EA2BF'}
              className={`w-full sm:w-auto text-xs sm:text-sm py-2.5 px-4 ${
                vistaActiva === 'acciones'
                  ? 'bg-gradient-to-r from-[#25B161] to-[#10B981] border border-emerald-500/30 shadow-lg shadow-emerald-950/20 hover:shadow-[0_0_15px_rgba(37,177,97,0.3)] scale-[1.02]'
                  : 'bg-[#0E1015] border border-[#23282F] hover:bg-[#22272F] hover:text-[#E6EBF0] hover:border-[#3A4350]'
              }`}
            />
            <Button
              label='Órdenes'
              onClick={() => setVistaActiva('ordenes')}
              iconName='solar:clipboard-list-linear'
              color='className'
              textColor={vistaActiva === 'ordenes' ? '#ffffff' : '#8EA2BF'}
              className={`w-full sm:w-auto text-xs sm:text-sm py-2.5 px-4 ${
                vistaActiva === 'ordenes'
                  ? 'bg-gradient-to-r from-[#25B161] to-[#10B981] border border-emerald-500/30 shadow-lg shadow-emerald-950/20 hover:shadow-[0_0_15px_rgba(37,177,97,0.3)] scale-[1.02]'
                  : 'bg-[#0E1015] border border-[#23282F] hover:bg-[#22272F] hover:text-[#E6EBF0] hover:border-[#3A4350]'
              }`}
            />
          </div>
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
        token={session?.accessToken}
        onClose={() => setAccionSeleccionada(null)}
        onOrderSuccess={() => { void refreshPortfolio() }}
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
