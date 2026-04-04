import React from 'react'
import Image, { type ImageProps } from 'next/image'

interface ImagenProps extends Omit<ImageProps, 'src' | 'alt'> {
  ruta: string
  descripcion?: string
}

const Index = ({
  ruta,
  descripcion = '',
  width = 800,
  height = 600,
  className,
  sizes,
  ...props
}: ImagenProps) => {
  return (
    <Image
      src={ruta}
      alt={descripcion}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      {...props}
    />
  )
}

export default Index
