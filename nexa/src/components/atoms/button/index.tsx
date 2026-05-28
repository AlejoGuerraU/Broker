import React from 'react'
import Link from 'next/link'
import Icon from '@/components/atoms/icon'

interface ButtonProps {
  titulo?: string
  label?: string
  link?: string
  href?: string
  color?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
  textColor?: string
  disabled?: boolean
  iconName?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'sidebar'
  active?: boolean
  ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false
}

const variantClassNames = {
  default:
    'group relative overflow-hidden justify-center rounded-2xl border border-[var(--bg-border)] px-5 py-3 transition-all duration-300 shadow-md active:scale-[0.97] hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]',
  sidebar:
    'w-full justify-start rounded-lg px-4 py-2 transition-colors duration-300',
}

const Index = ({
  titulo,
  label,
  link,
  href,
  color,
  type = 'button',
  onClick,
  className = '',
  textColor,
  disabled = false,
  iconName,
  icon,
  iconPosition = 'left',
  variant = 'default',
  active = false,
  ariaCurrent,
}: ButtonProps) => {
  const contentLabel = titulo ?? label ?? ''
  const destination = href ?? link

  const style =
    variant === 'default'
      ? {
          backgroundColor: color,
          color: textColor,
        }
      : undefined

  const stateClassName =
    variant === 'sidebar'
      ? active
        ? 'bg-(--bg-accent) text-(--bg-primary)'
        : 'text-(--bg-text) hover:bg-(--bg-accent)'
      : 'cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'

  const resolvedIcon =
    icon ??
    (iconName ? (
      <Icon
        name={iconName}
        width={20}
        height={20}
        color={variant === 'sidebar' && active ? 'var(--bg-primary)' : undefined}
      />
    ) : null)

  const content = (
    <>
      {variant === 'default' && (
        <span className='absolute inset-0 bg-white/[0.08] opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none' />
      )}
      {iconPosition === 'left' && resolvedIcon && (
        <span className='relative z-10 flex items-center shrink-0'>{resolvedIcon}</span>
      )}
      <span className='relative z-10'>{contentLabel}</span>
      {iconPosition === 'right' && resolvedIcon && (
        <span className='relative z-10 flex items-center shrink-0'>{resolvedIcon}</span>
      )}
    </>
  )

  const composedClassName = [
    'flex items-center gap-2 font-medium',
    variantClassNames[variant],
    stateClassName,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (destination) {
    return (
      <Link
        href={destination}
        onClick={onClick}
        aria-current={ariaCurrent}
        className={composedClassName}
        style={style}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      style={style}
      disabled={disabled}
      className={composedClassName}
    >
      {content}
    </button>
  )
}

export default Index
