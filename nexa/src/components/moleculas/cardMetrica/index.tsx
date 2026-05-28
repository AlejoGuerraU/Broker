import React from 'react'
import Icon from '@/components/atoms/icon'

interface CardMetricaProps {
    titulo: string
    iconName: string
    textMetrica: string
    iconMetrica?: string
    color?: string
}

const Index = ({ titulo, iconName, textMetrica, iconMetrica, color }: CardMetricaProps) => {
    const textStyle = color ? { color } : undefined
    const hasMetricIcon = Boolean(iconMetrica?.trim())
    
    // Modern colors and styles
    const iconWrapperStyle = color
        ? { backgroundColor: `${color}15`, color, borderColor: `${color}25` }
        : { backgroundColor: 'rgba(255, 255, 255, 0.04)', color: 'var(--bg-text)', borderColor: 'rgba(255,255,255,0.08)' }

    const glowColor = color || '#25B161'
    const hoverBorderColor = color ? `${color}35` : 'rgba(255,255,255,0.15)'

    return (
        <article 
            className='group relative overflow-hidden rounded-[24px] border border-[var(--bg-border)] bg-[var(--card-color)] p-5 sm:p-6 shadow-[0_16px_36px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]'
            style={{ 
                '--hover-border': hoverBorderColor 
            } as React.CSSProperties}
        >
            {/* Smooth glowing indicator in corner */}
            <div 
                className='absolute -right-12 -bottom-12 h-28 w-28 rounded-full blur-[40px] opacity-10 transition-opacity duration-500 group-hover:opacity-20 pointer-events-none'
                style={{ backgroundColor: glowColor }}
            />
            
            {/* Top border ambient highlight */}
            <div className='absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent' />

            {/* Inner dynamic border highlight on hover */}
            <div className='absolute inset-0 border border-transparent group-hover:border-[var(--hover-border)] rounded-[24px] transition-colors duration-300 pointer-events-none' />

            <div className='flex h-full flex-col justify-between gap-6 relative z-10'>
                <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-1.5'>
                        <span className='block text-[11px] font-bold uppercase tracking-wider text-[#75808F]'>
                            {titulo}
                        </span>
                        <h3 
                            className='break-words text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--bg-text)] mt-1 transition-colors duration-300'
                            style={textStyle}
                        >
                            {textMetrica}
                        </h3>
                    </div>

                    <div
                        className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(0,0,0,0.2)]'
                        style={iconWrapperStyle}
                    >
                        <Icon name={iconName} width={24} height={24} color='currentColor' className='transition-transform duration-300 group-hover:scale-110' />
                    </div>
                </div>

                <div className='flex items-center'>
                    <div className='inline-flex items-center gap-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-1.5 text-xs text-[#8EA2BF] group-hover:border-white/[0.08] transition-colors duration-300'>
                        {hasMetricIcon ? (
                            <Icon name={iconMetrica!} color={color} width={16} height={16} />
                        ) : (
                            <Icon name='solar:info-circle-linear' color={color || '#25B161'} width={16} height={16} />
                        )}
                        <span className='font-medium text-[#75808F] group-hover:text-[#8EA2BF] transition-colors duration-300'>
                            Métrica de cuenta
                        </span>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default Index
