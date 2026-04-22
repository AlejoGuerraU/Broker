import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Icon } from '@iconify/react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/portafolio')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className='flex h-screen items-center justify-center bg-[var(--bg-color)]'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-color)] border-t-transparent' />
      </div>
    )
  }

  return (
    <div className='flex h-screen items-center justify-center bg-[var(--bg-color)] p-4'>
      <div className='w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl'>
        <div className='bg-[var(--primary-color)] p-8 text-center text-white'>
          <Icon icon='ph:rocket-launch-duotone' className='mx-auto mb-4 text-6xl' />
          <h1 className='text-3xl font-bold tracking-tight'>Broker App</h1>
          <p className='mt-2 opacity-90'>Bienvenido a tu plataforma de inversión</p>
        </div>

        <div className='p-8 text-center'>
          <h2 className='mb-6 text-xl font-semibold text-[var(--text-color)]'>Inicia sesión para continuar</h2>
          
          <button
            onClick={() => signIn('google')}
            className='flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-color)] bg-white px-6 py-4 text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.98]'
          >
            <Icon icon='logos:google-icon' className='text-2xl' />
            <span className='font-medium'>Continuar con Google</span>
          </button>

          <p className='mt-8 text-sm text-[var(--text-color-muted)]'>
            Al continuar, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  )
}
