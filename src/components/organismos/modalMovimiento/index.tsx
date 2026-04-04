import React, { useMemo, useState } from 'react'
import Button from '@/components/atoms/button'
import Icon from '@/components/atoms/icon'
import Input from '@/components/atoms/input'
import Select from '@/components/atoms/select'
import FieldControl from '@/components/moleculas/fieldControl'
import ToggleMovimiento from '@/components/moleculas/toggleMovimiento'
import type { MovimientoItem, MovimientoTipo } from '@/types/movimiento'

interface ModalMovimientoProps {
  isOpen: boolean
  onClose: () => void
  onSave: (movimiento: Omit<MovimientoItem, 'id'>) => Promise<void> | void
  movimiento?: MovimientoItem | null
}

const categorias = [
  { label: 'Selecciona categoria', value: '' },
  { label: 'Alimentacion', value: 'alimentacion' },
  { label: 'Vivienda', value: 'vivienda' },
  { label: 'Transporte', value: 'transporte' },
  { label: 'Salud', value: 'salud' },
  { label: 'Servicios', value: 'servicios' },
  { label: 'Entretenimiento', value: 'entretenimiento' },
  { label: 'Inversiones', value: 'inversiones' },
  { label: 'Salario', value: 'salario' },
  { label: 'Freelance', value: 'freelance' },
]

const formatDate = (value: string) => {
  if (!value) {
    return ''
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const initialFormState = {
  tipoMovimiento: 'egreso' as MovimientoTipo,
  monto: '',
  categoria: '',
  descripcion: '',
  fecha: '2026-04-01',
}

const getInitialFormState = (movimiento: MovimientoItem | null) => {
  if (!movimiento) {
    return initialFormState
  }

  return {
    tipoMovimiento: movimiento.tipo,
    monto: String(movimiento.monto),
    categoria: getCategoriaValue(movimiento.categoria),
    descripcion: movimiento.descripcion,
    fecha: movimiento.fecha,
  }
}

const getCategoriaValue = (categoria: string) => {
  const categoriaNormalizada = categoria.trim().toLowerCase()
  const categoriaEncontrada = categorias.find(
    (item) => item.label.toLowerCase() === categoriaNormalizada || item.value === categoriaNormalizada,
  )

  return categoriaEncontrada?.value ?? categoriaNormalizada
}

const Index = ({ isOpen, onClose, onSave, movimiento = null }: ModalMovimientoProps) => {
  const initialValues = getInitialFormState(movimiento)
  const [tipoMovimiento, setTipoMovimiento] = useState<MovimientoTipo>(initialValues.tipoMovimiento)
  const [monto, setMonto] = useState(initialValues.monto)
  const [categoria, setCategoria] = useState(initialValues.categoria)
  const [descripcion, setDescripcion] = useState(initialValues.descripcion)
  const [fecha, setFecha] = useState(initialValues.fecha)

  const fechaFormateada = useMemo(() => formatDate(fecha), [fecha])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const categoriaSeleccionada = categorias.find((item) => item.value === categoria)?.label ?? ''

    await onSave({
      tipo: tipoMovimiento,
      monto: Number(monto),
      categoria: categoriaSeleccionada || categoria.trim(),
      descripcion: descripcion.trim(),
      fecha,
    })
    onClose()
  }

  if (!isOpen) {
    return null
  }

  const accentColor = tipoMovimiento === 'egreso' ? '#FF4D4F' : '#25B161'
  const amountClassName =
    tipoMovimiento === 'egreso'
      ? 'border-[#7A2028] bg-[#2A171C] text-[#FF4D4F]'
      : 'border-[#1F6E41] bg-[#15281F] text-[#7BE0A3]'
  const modalTitle = movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'
  const submitLabel = movimiento ? 'Guardar Cambios' : 'Guardar Movimiento'

  return (
    <div className='fixed inset-0 z-50 bg-black/55 px-3 py-3 sm:px-4 sm:py-4'>
      <div className='flex min-h-full items-start justify-center sm:items-center'>
        <div className='max-h-[calc(100vh-1.5rem)] w-full max-w-[460px] overflow-y-auto rounded-[20px] border border-[var(--bg-border)] bg-[var(--card-color)] p-4 sm:max-h-[calc(100vh-2rem)] sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]'>
          <div className='mb-5 flex items-start justify-between gap-3'>
            <h2 className='text-[20px] font-semibold leading-none text-[var(--bg-text)]'>{modalTitle}</h2>
            <button
              type='button'
              onClick={onClose}
              className='text-[var(--bg-muted)] transition-colors hover:text-[var(--bg-text)]'
              aria-label='Cerrar modal'
            >
              <Icon name='mdi:close' width={20} height={20} />
            </button>
          </div>

          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <ToggleMovimiento value={tipoMovimiento} onChange={setTipoMovimiento} />

            <FieldControl label='Monto'>
              <div
                className={`flex h-11 items-center gap-2 rounded-xl border px-4 transition-colors ${amountClassName}`}
              >
                <span className='text-base font-semibold' style={{ color: accentColor }}>
                  $
                </span>
                <Input
                  type='number'
                  placeholder='0.00'
                  value={monto}
                  onChange={(event) => setMonto(event.target.value)}
                  min='0'
                  step='0.01'
                  required
                  className='h-full border-none bg-transparent p-0 text-base font-semibold text-inherit focus:border-none'
                />
              </div>
            </FieldControl>

            <FieldControl label='Categoria'>
              <Select
                value={categoria}
                onChange={(event) => setCategoria(event.target.value)}
                options={categorias}
                required
              />
            </FieldControl>

            <FieldControl label='Descripcion'>
              <Input
                type='text'
                placeholder='Ej: Almuerzo con el equipo'
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                required
              />
            </FieldControl>

            <FieldControl label='Fecha'>
              <div className='relative'>
                <div className='pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--bg-text)]'>
                  <Icon name='solar:calendar-linear' width={18} height={18} />
                </div>
                <Input
                  type='date'
                  value={fecha}
                  onChange={(event) => setFecha(event.target.value)}
                  required
                  className='pl-14 text-transparent [color-scheme:dark]'
                />
                <span className='pointer-events-none absolute inset-y-0 left-14 flex items-center text-sm font-medium text-[var(--bg-text)]'>
                  {fechaFormateada}
                </span>
              </div>
            </FieldControl>

            <div className='mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Button
                titulo='Cancelar'
                onClick={onClose}
                color='#22272F'
                className='h-11 rounded-xl text-base'
              />
              <Button
                titulo={submitLabel}
                type='submit'
                color='#25B161'
                className='h-11 rounded-xl border-[#25B161] text-base text-white'
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Index
