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
}

const buildAreaColor = (hexColor: string) => `${hexColor}20`

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
}: CardAccionesProps) => {
  const data: ChartData<'line'> = {
    labels,
    datasets: series.map((serie) => {
      const color = serie.color ?? '#25B161'

      return {
        label: serie.label,
        data: serie.values,
        borderColor: color,
        backgroundColor: buildAreaColor(color),
        fill: serie.fill ?? true,
        tension: serie.tension ?? 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
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
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#7D8592',
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
        min: minY,
        max: maxY,
        grid: {
          color: 'rgba(255,255,255,0.06)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#7D8592',
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
        <Line data={data} options={options} />
      </div>
    </article>
  )
}

export default Index
