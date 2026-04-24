import React from 'react'

interface FieldControlProps {
  label: string
  children: React.ReactNode
}

const Index = ({ label, children }: FieldControlProps) => {
  return (
    <label className='flex flex-col gap-2'>
      <span className='text-sm font-medium text-[var(--bg-muted)]'>{label}</span>
      {children}
    </label>
  )
}

export default Index
