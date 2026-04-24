import React from 'react'
import Icon from '@/components/atoms/icon'
import { BigText, SubTexto } from '@/components/atoms/heroTitles'

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
    const iconWrapperStyle = color
        ? { backgroundColor: `${color}1A`, color }
        : { backgroundColor: 'rgba(255, 255, 255, 0.06)', color: 'var(--bg-text)' }
    const metricBadgeStyle = color
        ? { backgroundColor: `${color}14`, borderColor: `${color}33` }
        : { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'var(--bg-border)' }

    return (
        <article className='group relative overflow-hidden rounded-2xl border border-[var(--bg-border)] bg-[var(--card-color)] p-4 sm:p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1'>
            <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent' />
            <div className='flex h-full flex-col justify-between gap-5'>
                <div className='flex items-start justify-between gap-4'>
                    <div className='space-y-2'>
                        <SubTexto text={titulo} className='uppercase tracking-[0.18em] text-[var(--bg-muted)]' />
                        <BigText text={textMetrica} style={textStyle} className='break-words font-semibold text-[var(--bg-text)]' />
                    </div>

                    <div
                        className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                        style={iconWrapperStyle}
                    >
                        <Icon name={iconName} width={24} height={24} color='currentColor' />
                    </div>
                </div>

                <div
                    className='flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-sm text-[var(--bg-text)]'
                    style={metricBadgeStyle}
                >
                    {hasMetricIcon ? <Icon name={iconMetrica!} color={color} width={18} height={18} /> : null}
                    <span className='font-medium text-[var(--bg-muted)]'>Resumen actual</span>
                </div>
            </div>
        </article>
    )
}

export default Index
