import React from 'react'

interface TableShellProps {
  title: string
  description: string
  actions?: React.ReactNode
  children: React.ReactNode
}

const Index = ({ title, description, actions, children }: TableShellProps) => {
  return (
    <section className='overflow-hidden rounded-[24px] border border-[var(--bg-border)] bg-[var(--card-color)] shadow-[0_18px_40px_rgba(0,0,0,0.24)]'>
      <div className='flex flex-col gap-4 border-b border-[var(--bg-border)] px-4 py-4 sm:px-5 sm:py-5 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-[clamp(1.35rem,3vw,1.75rem)] font-semibold text-[var(--bg-text)]'>{title}</h2>
          <p className='mt-1 text-sm text-[var(--bg-muted)]'>{description}</p>
        </div>

        {actions ? <div className='flex flex-wrap gap-2 max-sm:overflow-x-auto max-sm:pb-1'>{actions}</div> : null}
      </div>

      <div className='overflow-x-auto'>{children}</div>
    </section>
  )
}

export default Index
