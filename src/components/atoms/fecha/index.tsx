import React from 'react'
interface FechaProps {
  fecha: Date;
}
const Index = ({ fecha }: FechaProps) => {
  return (
    <div>{fecha.toLocaleDateString()}</div>
  )
}

export default Index