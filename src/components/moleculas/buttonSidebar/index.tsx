import React from 'react'
import Button from '@/components/atoms/button'

interface ButtonSidebarProps {
  title: string
  link: string
  nameIcon?: string
  active?: boolean
  onClick?: () => void
}

const Index = ({ title, link, nameIcon, active = false, onClick }: ButtonSidebarProps) => {
  return (
    <Button
      label={title}
      href={link}
      onClick={onClick}
      ariaCurrent={active ? 'page' : undefined}
      iconName={nameIcon}
      active={active}
      variant='sidebar'
    />
  )
}

export default Index
