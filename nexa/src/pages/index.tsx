import React from 'react'
import Fecha from '@/components/atoms/fecha'
const Index = () => {
  return (
    <div className='flex justify-start items-center p-4'>
      <Fecha fecha={new Date()} />
    </div>
  )
}

export default Index