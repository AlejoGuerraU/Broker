'use client'

import React, { useMemo, useState } from 'react'
import Button from '@/components/atoms/button'
import Icon from '@/components/atoms/icon'
import Input from '@/components/atoms/input'

interface CuentaData {
  nombre: string
  idCuenta: string
  miembroDesde: string
  email: string
  telefono: string
  direccion: string
}

interface ModalCuentaProps {
  isOpen: boolean
  onClose: () => void
  cuenta: CuentaData
  onSave: (cuenta: CuentaData) => void
}

const infoFields = [
  { key: 'nombre', label: 'Nombre', icon: 'solar:user-linear' },
  { key: 'email', label: 'Email', icon: 'solar:letter-linear' },
  { key: 'telefono', label: 'Telefono', icon: 'solar:phone-linear' },
  { key: 'direccion', label: 'Direccion', icon: 'solar:map-point-linear' },
] as const

const Index = ({ isOpen, onClose, cuenta, onSave }: ModalCuentaProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(cuenta)

  const iniciales = useMemo(() => {
    return formData.nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? '')
      .join('')
  }, [formData.nombre])

  const handleClose = () => {
    setFormData(cuenta)
    setIsEditing(false)
    onClose()
  }

  const handleChange = (field: keyof CuentaData, value: string) => {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    onSave(formData)
    setIsEditing(false)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className='fixed inset-0 z-60 bg-black/60 px-3 py-3 sm:px-4 sm:py-6'>
      <div className='flex min-h-full items-center justify-center'>
        <div className='max-h-[calc(100vh-1.5rem)] w-full max-w-[560px] overflow-y-auto rounded-[22px] border border-[var(--bg-border)] bg-[#171B21] p-4 sm:max-h-[calc(100vh-3rem)] sm:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.45)]'>
          <div className='mb-6 flex items-start justify-between gap-4 sm:mb-8'>
            <h2 className='text-[clamp(1.35rem,3vw,1.5rem)] font-semibold text-[var(--bg-text)]'>Mi Cuenta</h2>
            <button
              type='button'
              onClick={handleClose}
              className='text-[var(--bg-muted)] transition-colors hover:text-[var(--bg-text)]'
              aria-label='Cerrar modal de cuenta'
            >
              <Icon name='mdi:close' width={22} height={22} />
            </button>
          </div>

          <div className='mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:gap-5'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[#163D2C] text-[32px] font-semibold text-[#29C46C] sm:h-22 sm:w-22 sm:text-[38px]'>
              {iniciales}
            </div>

            <div className='space-y-1'>
              <p className='text-[18px] font-semibold text-[var(--bg-text)]'>{formData.nombre}</p>
              <p className='text-sm text-[var(--bg-muted)]'>ID: {formData.idCuenta}</p>
              <p className='text-sm text-[var(--bg-muted)]'>Miembro desde {formData.miembroDesde}</p>
            </div>
          </div>

          <div className='space-y-5'>
            {infoFields.map((field) => (
              <div key={field.key} className='space-y-2'>
                <label className='flex items-center gap-2 text-sm text-[var(--bg-muted)]'>
                  <Icon name={field.icon} width={18} height={18} />
                  <span>{field.label}</span>
                </label>
                <Input
                  type='text'
                  value={formData[field.key]}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  readOnly={!isEditing}
                  className={isEditing ? 'bg-[#1B2028]' : 'border-transparent bg-[#1B2028]'}
                />
              </div>
            ))}
          </div>

          <div className='mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2'>
            {isEditing ? (
              <>
                <Button
                  titulo='Cancelar'
                  onClick={() => {
                    setFormData(cuenta)
                    setIsEditing(false)
                  }}
                  color='#22272F'
                  className='h-12 rounded-2xl text-base'
                />
                <Button
                  titulo='Guardar Perfil'
                  onClick={handleSubmit}
                  color='#25B161'
                  className='h-12 rounded-2xl text-base text-white'
                  iconName='solar:diskette-linear'
                />
              </>
            ) : (
              <Button
                titulo='Editar Perfil'
                onClick={() => setIsEditing(true)}
                color='#25B161'
                className='h-12 rounded-2xl text-base text-white sm:col-span-2'
                iconName='solar:pen-2-linear'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export type { CuentaData }
export default Index
