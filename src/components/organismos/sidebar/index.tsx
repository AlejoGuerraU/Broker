'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import ButtonSidebar from '@/components/moleculas/buttonSidebar'
import TitleSidebar from '@/components/moleculas/titleSidebar'

const navItems = [
  { id: '/portafolio', title: 'Portafolio', nameIcon: 'streamline:baggage-remix' },
  { id: '/invertir', title: 'Invertir', nameIcon: 'streamline:money-graph-arrow-increase-ascend-growth-up-arrow-stats-graph-right-grow' },
  { id: '/controlador', title: 'Control De Dinero', nameIcon: 'lucide:wallet' },
  { id: '/noticias', title: 'Noticias', nameIcon: 'lucide:newspaper' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Index = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname()

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity md:hidden ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden='true'
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-62.5 shrink-0 bg-(--bg-sidebar) p-4 transition-transform duration-300 md:sticky md:top-0 md:z-30 md:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:w-0 md:-translate-x-0 md:overflow-hidden md:p-0'
        }`}
      >
        <div className='flex h-full flex-col gap-6'>
          <TitleSidebar />

          <nav aria-label='Navegacion principal' className='flex flex-col gap-2'>
            {navItems.map((item) => (
              <ButtonSidebar
                key={item.id}
                title={item.title}
                nameIcon={item.nameIcon}
                active={pathname === item.id}
                link={item.id}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Index
