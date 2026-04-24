'use client'

import React from 'react'
import Icon from '@/components/atoms/icon'

interface CuentaResumen {
  nombre: string
}

interface NavbarProps {
  onToggleSidebar: () => void
  onOpenCuenta: () => void
  sidebarOpen: boolean
  cuenta: CuentaResumen
}

const getInitials = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('')

const Index = ({ onToggleSidebar, onOpenCuenta, sidebarOpen, cuenta }: NavbarProps) => {
  return (
    <header className='sticky top-0 z-40 border-b border-[var(--bg-border)] bg-[rgba(14,16,21,0.88)] px-3 py-3 backdrop-blur sm:px-4 md:px-6'>
      <div className='flex items-center justify-between gap-4'>
        <button
          type='button'
          onClick={onToggleSidebar}
          className='inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--bg-border)] bg-[#171B21] text-[var(--bg-text)] transition-colors hover:bg-[#1B2028]'
          aria-label={sidebarOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
        >
          <Icon name={sidebarOpen ? 'solar:hamburger-menu-linear' : 'solar:hamburger-menu-linear'} width={22} height={22} />
        </button>

        <button
          type='button'
          onClick={onOpenCuenta}
          className='flex items-center gap-2 rounded-2xl border border-[var(--bg-border)] bg-[#171B21] px-2 py-2 sm:gap-3 sm:pr-4 text-left transition-colors hover:bg-[#1B2028]'
          aria-label='Abrir informacion de la cuenta'
        >
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#163D2C] text-sm font-semibold text-[#29C46C]'>
            {getInitials(cuenta.nombre)}
          </div>
          <div className='hidden sm:block'>
            <p className='text-sm font-semibold text-[var(--bg-text)]'>{cuenta.nombre}</p>
            <p className='text-xs text-[var(--bg-muted)]'>Mi Cuenta</p>
          </div>
        </button>
      </div>
    </header>
  )
}

export default Index
