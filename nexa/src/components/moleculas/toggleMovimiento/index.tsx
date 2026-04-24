import React from 'react'

interface ToggleMovimientoProps {
  value: 'ingreso' | 'egreso'
  onChange: (value: 'ingreso' | 'egreso') => void
}

const Index = ({ value, onChange }: ToggleMovimientoProps) => {
  return (
    <div className='grid h-11 grid-cols-2 overflow-hidden rounded-xl border border-[var(--bg-border)] bg-[#171B21]'>
      <button
        type='button'
        onClick={() => onChange('ingreso')}
        className={`px-4 text-base font-medium transition-colors ${
          value === 'ingreso' ? 'bg-[#1D2C24] text-[#B8F3CB]' : 'text-[var(--bg-muted)]'
        }`}
      >
        Ingreso
      </button>
      <button
        type='button'
        onClick={() => onChange('egreso')}
        className={`px-4 text-base font-medium transition-colors ${
          value === 'egreso' ? 'bg-[#3B1D24] text-[#FF4D4F]' : 'text-[var(--bg-muted)]'
        }`}
      >
        Egreso
      </button>
    </div>
  )
}

export default Index
