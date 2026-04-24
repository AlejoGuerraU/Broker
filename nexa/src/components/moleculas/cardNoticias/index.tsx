import React from 'react'
import Fecha from '@/components/atoms/fecha'
import Imagen from '@/components/atoms/imagen'
import Icon from '@/components/atoms/icon'

interface CardNoticiasProps {
  titulo: string
  descripcion: string
  categoria: string
  fecha: Date
  imagen: string
  enlace: string
}

const Index = ({ titulo, descripcion, categoria, fecha, imagen, enlace }: CardNoticiasProps) => {
  return (
    <article className='group relative overflow-hidden rounded-[28px] border border-[var(--bg-border)] bg-[var(--card-color)] shadow-[0_18px_45px_rgba(0,0,0,0.2)] transition-transform duration-300 hover:-translate-y-1'>
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />

      <div className='grid min-h-full md:grid-cols-[280px_minmax(0,1fr)]'>
        <div className='relative overflow-hidden border-b border-[var(--bg-border)] bg-[#11161D] md:border-b-0 md:border-r'>
          <Imagen
            ruta={imagen}
            descripcion={titulo}
            width={320}
            height={220}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
          <div className='absolute left-4 top-4'>
            <span className='inline-flex rounded-full border border-[#2B6E47] bg-[#173322] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8EE7B1]'>
              {categoria}
            </span>
          </div>
        </div>

        <div className='flex flex-1 flex-col justify-between gap-6 p-5 md:p-6'>
          <div className='space-y-3'>
            <h3 className='text-[26px] font-semibold leading-tight text-[var(--bg-text)]'>{titulo}</h3>
            <p className='max-w-[70ch] text-sm leading-7 text-[var(--bg-muted)]'>{descripcion}</p>
          </div>

          <div className='flex flex-col gap-4 border-t border-white/6 pt-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2 text-sm text-[var(--bg-muted)]'>
              <Icon name='solar:calendar-linear' width={18} height={18} />
              <Fecha fecha={fecha} />
            </div>

            <a
              href={enlace}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-2 text-sm font-semibold text-[#63D88E] transition-colors hover:text-[#8EE7B1]'
            >
              <span>Leer mas</span>
              <Icon name='lucide:external-link' width={16} height={16} />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}

export default Index
