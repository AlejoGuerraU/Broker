import React from 'react'
import { Icon } from '@iconify/react'

const Index = () => {
  return (
    <div className='flex flex-row items-center justify-center'>
      <div className='mr-4 rounded-lg bg-(--bg-primary) p-2 text-(--bg-text)'>
        <Icon icon='nimbus:stats' width={24} height={24} />
      </div>
      <h1 className='font-bold text-(--bg-text)'>NexaBroker</h1>
    </div>
  )
}

export default Index
