import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { SessionProvider, useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import ModalCuenta, { type CuentaData } from '@/components/organismos/modalCuenta'
import Navbar from '@/components/organismos/navbar'
import Sidebar from '@/components/organismos/sidebar'

function AppContent({ Component, pageProps }: AppProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCuentaOpen, setIsCuentaOpen] = useState(false)
  
  // Sincronizar sidebar con viewport
  useEffect(() => {
    const syncSidebarWithViewport = () => {
      setIsSidebarOpen(window.innerWidth >= 768)
    }
    syncSidebarWithViewport()
    window.addEventListener('resize', syncSidebarWithViewport)
    return () => window.removeEventListener('resize', syncSidebarWithViewport)
  }, [])

  // Protección de rutas
  useEffect(() => {
    if (status === 'unauthenticated' && router.pathname !== '/login') {
      router.push('/login')
    }
  }, [status, router])

  // Datos de la cuenta (mezcla de sesión y locales)
  const [cuentaExtra, setCuentaExtra] = useState({
    idCuenta: 'BT-2026-00482',
    miembroDesde: 'Hoy',
    direccion: 'Pendiente de configurar',
    telefono: 'Pendiente de configurar',
  })

  // Si estamos cargando o no hay sesión (y no es la página de login), mostramos un loader
  if (status === 'loading' || (status === 'unauthenticated' && router.pathname !== '/login')) {
    return (
      <div className='flex h-screen items-center justify-center bg-[var(--bg-color)]'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-color)] border-t-transparent' />
      </div>
    )
  }

  // Si es la página de login, renderizamos directo sin sidebar/navbar
  if (router.pathname === '/login') {
    return <Component {...pageProps} />
  }

  const cuentaData: CuentaData = {
    nombre: session?.user?.name || 'Usuario',
    email: session?.user?.email || '',
    idCuenta: cuentaExtra.idCuenta,
    miembroDesde: cuentaExtra.miembroDesde,
    telefono: cuentaExtra.telefono,
    direccion: cuentaExtra.direccion,
  }

  return (
    <div className='flex h-screen overflow-hidden bg-[var(--bg-color)]'>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className='min-w-0 flex-1 overflow-y-auto'>
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen((currentState) => !currentState)}
          onOpenCuenta={() => setIsCuentaOpen(true)}
          sidebarOpen={isSidebarOpen}
          cuenta={cuentaData}
        />

        <main className='min-w-0'>
          <Component {...pageProps} />
        </main>
      </div>

      <ModalCuenta
        isOpen={isCuentaOpen}
        onClose={() => setIsCuentaOpen(false)}
        cuenta={cuentaData}
        onSignOut={() => {
          setIsCuentaOpen(false)
          signOut({ callbackUrl: '/login' })
        }}
        onSave={(updated) => {
          setCuentaExtra({
            ...cuentaExtra,
            telefono: updated.telefono,
            direccion: updated.direccion,
          })
          setIsCuentaOpen(false)
        }}
      />
    </div>
  )
}

export default function App(props: AppProps) {
  return (
    <SessionProvider session={props.pageProps.session}>
      <AppContent {...props} />
    </SessionProvider>
  )
}
