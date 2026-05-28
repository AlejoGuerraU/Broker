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
  const isRemoteImage = /^https?:\/\//i.test(ruta)

  if (isRemoteImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={ruta}
        alt={descripcion}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        className={className}
        loading='lazy'
        referrerPolicy='no-referrer'
      />
    )
  }

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
