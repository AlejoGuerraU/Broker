import React from 'react'
import Input from '@/components/atoms/input'
import Button from '@/components/atoms/button'
import { BigText, SubTexto, SubTitle } from '@/components/atoms/heroTitles'

interface CardComprarProps {
  nombreAccion?: string
  simbolo?: string
  precio?: string
  variacion?: number
}

const Index = ({
  nombreAccion = 'Selecciona una accion',
  simbolo = '---',
  precio = '$0.00',
  variacion = 0,
}: CardComprarProps) => {
  const esPositiva = variacion >= 0

  return (
    <div className='flex w-full flex-col gap-4 rounded-2xl border border-[var(--bg-border)] bg-[var(--card-color)] p-4 sm:p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1'>
      <div className='space-y-2'>
        <SubTitle text='Comprar acciones' />
        <div className='space-y-1'>
          <SubTexto text={`${nombreAccion} · ${simbolo}`} className='break-words text-[var(--bg-muted)]' />
          <BigText text={precio} className='font-semibold text-[var(--bg-text)]' />
          <SubTexto
            text={`${esPositiva ? '+' : ''}${variacion.toFixed(2)}% hoy`}
            className={esPositiva ? 'text-[#25B161]' : 'text-[#FF6B6B]'}
          />
        </div>
      </div>

      <Input type='number' placeholder='Cantidad de acciones' />
      <Button titulo='Comprar' color='#25B161' textColor='#E6EBF0' />
    </div>
  )
}

export default Index
