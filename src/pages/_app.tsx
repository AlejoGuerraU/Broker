import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import ModalCuenta, { type CuentaData } from '@/components/organismos/modalCuenta'
import Navbar from '@/components/organismos/navbar'
import Sidebar from '@/components/organismos/sidebar'

export default function App({ Component, pageProps }: AppProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCuentaOpen, setIsCuentaOpen] = useState(false)
  const [cuenta, setCuenta] = useState<CuentaData>({
    nombre: 'Juan Delgado',
    idCuenta: 'BT-2026-00482',
    miembroDesde: '15 de enero, 2025',
    email: 'juan.delgado@email.com',
    telefono: '+34 612 345 678',
    direccion: 'Madrid, Espana',
  })

  useEffect(() => {
    const syncSidebarWithViewport = () => {
      setIsSidebarOpen(window.innerWidth >= 768)
    }

    syncSidebarWithViewport()
    window.addEventListener('resize', syncSidebarWithViewport)

    return () => window.removeEventListener('resize', syncSidebarWithViewport)
  }, [])

  return (
    <div className='flex h-screen overflow-hidden bg-[var(--bg-color)]'>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className='min-w-0 flex-1 overflow-y-auto'>
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((currentState) => !currentState)}
          onOpenCuenta={() => setIsCuentaOpen(true)}
          sidebarOpen={isSidebarOpen}
          cuenta={cuenta}
        />

        <main className='min-w-0'>
          <Component {...pageProps} />
        </main>
      </div>

      <ModalCuenta
        isOpen={isCuentaOpen}
        onClose={() => setIsCuentaOpen(false)}
        cuenta={cuenta}
        onSave={(nextCuenta) => {
          setCuenta(nextCuenta)
          setIsCuentaOpen(false)
        }}
      />
    </div>
  )
}
