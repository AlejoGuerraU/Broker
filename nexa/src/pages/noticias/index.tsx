import React, { useMemo, useState } from 'react'
import CardNoticias from '@/components/moleculas/cardNoticias'
import Icon from '@/components/atoms/icon'
import { HeroTitle, SubTexto } from '@/components/atoms/heroTitles'

type CategoriaNoticia = 'Todas' | 'Acciones' | 'Cripto' | 'Mundiales'

interface NoticiaItem {
  id: number
  titulo: string
  descripcion: string
  categoria: Exclude<CategoriaNoticia, 'Todas'>
  fecha: Date
  imagen: string
  enlace: string
}

const filtros: Array<{ id: CategoriaNoticia; icono: string; descripcion: string }> = [
  { id: 'Todas', icono: 'solar:widget-3-linear', descripcion: 'Resumen general del mercado' },
  { id: 'Acciones', icono: 'solar:chart-square-linear', descripcion: 'Movimientos de renta variable' },
  { id: 'Cripto', icono: 'solar:bitcoin-circle-linear', descripcion: 'Actualidad del ecosistema crypto' },
  { id: 'Mundiales', icono: 'solar:global-linear', descripcion: 'Contexto macro y geopolítico' },
]

const noticiasMock: NoticiaItem[] = [
  {
    id: 1,
    titulo: 'NVIDIA y Microsoft lideran la sesion tras nuevos maximos del Nasdaq',
    descripcion:
      'Las tecnologicas impulsan el mercado con renovado apetito por inteligencia artificial, mientras los inversores siguen atentos a resultados y guidance del proximo trimestre.',
    categoria: 'Acciones',
    fecha: new Date('2026-04-03'),
    imagen: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    enlace: '#',
  },
  {
    id: 2,
    titulo: 'Bitcoin recupera impulso y arrastra al alza a las principales altcoins',
    descripcion:
      'El mercado cripto vuelve a tomar fuerza gracias a entradas institucionales y una mejora en el sentimiento de riesgo, con ETH y SOL entre los activos mas destacados.',
    categoria: 'Cripto',
    fecha: new Date('2026-04-02'),
    imagen: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1200&q=80',
    enlace: '#',
  },
  {
    id: 3,
    titulo: 'Los mercados globales ajustan expectativas ante nuevas senales de politica monetaria',
    descripcion:
      'Bonos, acciones y divisas reaccionan a comentarios recientes de bancos centrales, en una semana marcada por datos de inflacion y empleo en distintas regiones.',
    categoria: 'Mundiales',
    fecha: new Date('2026-04-01'),
    imagen: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    enlace: '#',
  },
  {
    id: 4,
    titulo: 'Apple y Amazon concentran el volumen de negociacion en una jornada mixta',
    descripcion:
      'Los operadores priorizan nombres defensivos y grandes capitalizaciones mientras esperan nuevos catalizadores para definir la direccion del mercado durante abril.',
    categoria: 'Acciones',
    fecha: new Date('2026-03-31'),
    imagen: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    enlace: '#',
  },
]

const Index = () => {
  const [filtroActivo, setFiltroActivo] = useState<CategoriaNoticia>('Todas')

  const noticiasFiltradas = useMemo(() => {
    if (filtroActivo === 'Todas') {
      return noticiasMock
    }

    return noticiasMock.filter((noticia) => noticia.categoria === filtroActivo)
  }, [filtroActivo])

  return (
    <div className='flex flex-col gap-5 p-4 sm:gap-6'>
      <section className='overflow-hidden rounded-[30px] border border-[var(--bg-border)] bg-[radial-gradient(circle_at_top_left,rgba(37,177,97,0.18),transparent_35%),linear-gradient(180deg,#171B21_0%,#11151B_100%)] p-4 sm:p-6 shadow-[0_20px_55px_rgba(0,0,0,0.18)]'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
          <div className='max-w-2xl space-y-3'>
            <span className='inline-flex rounded-full border border-[#2B6E47] bg-[#173322] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8EE7B1]'>
              Centro de noticias
            </span>
            <HeroTitle text='Noticias del Mercado' className='leading-none text-[var(--bg-text)]' />
            <SubTexto
              text='Filtra por categoria y revisa rapidamente lo mas relevante del mercado en acciones, cripto y panorama global.'
              className='max-w-xl text-[15px] leading-7 text-[var(--bg-muted)]'
            />
          </div>

          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            {filtros.map((filtro) => {
              const isActive = filtroActivo === filtro.id

              return (
                <button
                  key={filtro.id}
                  type='button'
                  onClick={() => setFiltroActivo(filtro.id)}
                  className={`rounded-[24px] border px-4 py-4 text-left transition-all duration-300 ${isActive
                      ? 'border-[#25B161] bg-[#173322] shadow-[0_14px_28px_rgba(37,177,97,0.18)]'
                      : 'border-[var(--bg-border)] bg-[#171B21] hover:border-white/10 hover:bg-[#1A2027]'
                    }`}
                >
                  <div className='mb-3 flex items-center justify-between gap-3'>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? 'bg-[#25B161] text-white' : 'bg-[#202733] text-[var(--bg-text)]'
                        }`}
                    >
                      <Icon name={filtro.icono} width={20} height={20} />
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isActive ? 'bg-white/12 text-white' : 'bg-[#202733] text-[var(--bg-muted)]'
                        }`}
                    >
                      {filtro.id}
                    </span>
                  </div>

                  <p className='text-base font-semibold text-[var(--bg-text)]'>{filtro.id}</p>
                  <p className='mt-1 text-sm leading-6 text-[var(--bg-muted)]'>{filtro.descripcion}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className='space-y-4'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-[clamp(1.35rem,3vw,1.75rem)] font-semibold text-[var(--bg-text)]'>
              {filtroActivo === 'Todas' ? 'Todas las noticias' : `Noticias de ${filtroActivo}`}
            </h2>
            <p className='text-sm text-[var(--bg-muted)]'>
              {noticiasFiltradas.length} resultado{noticiasFiltradas.length === 1 ? '' : 's'} disponibles
            </p>
          </div>
        </div>

        <div className='grid gap-5'>
          {noticiasFiltradas.map((noticia) => (
            <CardNoticias
              key={noticia.id}
              titulo={noticia.titulo}
              descripcion={noticia.descripcion}
              categoria={noticia.categoria}
              fecha={noticia.fecha}
              imagen={noticia.imagen}
              enlace={noticia.enlace}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Index
