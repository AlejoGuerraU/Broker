'use client'

import React from 'react'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  type ScriptableContext,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { BigText, SubTexto, SubTitle } from '@/components/atoms/heroTitles'

ChartJS.register(CategoryScale, LineElement, LinearScale, PointElement, Title, Tooltip, Legend, Filler)

interface ChartSerie {
  label: string
  values: number[]
  color?: string
  fill?: boolean
  tension?: number
}

interface CardAccionesProps {
  titulo: string
  labels: string[]
  series: ChartSerie[]
  valorActual?: string
  variacion?: string
  descripcion?: string
  xAxisLabel?: string
  yAxisLabel?: string
  minY?: number
  maxY?: number
  showLegend?: boolean
  className?: string
  valueFormatter?: (value: number) => string
}

const Index = ({
  titulo,
  labels,
  series,
  valorActual,
  variacion,
  descripcion,
  xAxisLabel,
  yAxisLabel,
  minY,
  maxY,
  showLegend = false,
  className = '',
  valueFormatter = (value) => value.toString(),
}: CardAccionesProps) => {
  const hasData = labels.length > 0 && series.some((serie) => serie.values.length > 0)
  const allValues = series.flatMap((serie) => serie.values)
  const computedMin = allValues.length > 0 ? Math.min(...allValues) : undefined
  const computedMax = allValues.length > 0 ? Math.max(...allValues) : undefined
  const yPadding =
    computedMin !== undefined && computedMax !== undefined
      ? Math.max((computedMax - computedMin) * 0.12, computedMax * 0.015, 1)
      : undefined

  const data: ChartData<'line'> = {
    labels,
    datasets: series.map((serie) => {
      const color = serie.color ?? '#25B161'

      return {
        label: serie.label,
        data: serie.values,
        borderColor: color,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart
          const { ctx, chartArea } = chart

          if (!chartArea) {
            return `${color}20`
          }

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, `${color}55`)
          gradient.addColorStop(1, `${color}06`)
          return gradient
        },
        fill: serie.fill ?? true,
        tension: serie.tension ?? 0.35,
        pointRadius: 0,
        pointHitRadius: 18,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 2,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#0B1015',
        borderWidth: 2.5,
      }
    }),
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: showLegend,
        labels: {
          color: '#9CA3AF',
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#E6EBF0',
        bodyColor: '#E6EBF0',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        displayColors: showLegend,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y
            const prefix = context.dataset.label ? `${context.dataset.label}: ` : ''
            if (typeof value !== 'number') {
              return `${prefix}N/D`
            }
            return `${prefix}${valueFormatter(value)}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255,255,255,0.04)',
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#7D8592',
          maxRotation: 0,
        },
        title: xAxisLabel
          ? {
              display: true,
              text: xAxisLabel,
              color: '#7D8592',
            }
          : undefined,
      },
      y: {
        min: minY ?? (computedMin !== undefined && yPadding !== undefined ? computedMin - yPadding : undefined),
        max: maxY ?? (computedMax !== undefined && yPadding !== undefined ? computedMax + yPadding : undefined),
        grid: {
          color: 'rgba(255,255,255,0.06)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#7D8592',
          callback: (value) => valueFormatter(Number(value)),
        },
        title: yAxisLabel
          ? {
              display: true,
              text: yAxisLabel,
              color: '#7D8592',
            }
          : undefined,
      },
    },
  }

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-[var(--bg-border)] bg-[var(--card-color)] p-5 shadow-[0_14px_30px_rgba(0,0,0,0.22)] ${className}`.trim()}
    >
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent' />

      <div className='mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div className='space-y-2'>
          <SubTitle text={titulo} className='text-[var(--bg-text)]' />
          {descripcion ? <SubTexto text={descripcion} className='text-[var(--bg-muted)]' /> : null}
        </div>

        {valorActual || variacion ? (
          <div className='space-y-1 text-left md:text-right'>
            {valorActual ? <BigText text={valorActual} className='font-semibold text-[var(--bg-text)]' /> : null}
            {variacion ? (
              <SubTexto
                text={variacion}
                className={variacion.trim().startsWith('-') ? 'text-[#FF6B6B]' : 'text-[#25B161]'}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      <div className='h-[260px] w-full'>
        {hasData ? (
          <Line data={data} options={options} />
        ) : (
          <div className='flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0D1116] px-6 text-center'>
            <SubTexto text='No hay historial suficiente para graficar este activo.' className='text-[var(--bg-muted)]' />
          </div>
        )}
      </div>
    </article>
  )
}

export default Index
