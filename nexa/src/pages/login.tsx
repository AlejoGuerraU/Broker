import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Icon } from '@iconify/react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const authError = typeof router.query.error === 'string' ? router.query.error : null
  const authMessage = typeof router.query.message === 'string' ? decodeURIComponent(router.query.message) : null
  const sessionError = session?.error

  useEffect(() => {
    // Solo redirigir si está autenticado Y no hay error de backend en la sesión
    if (status === 'authenticated' && !sessionError) {
      router.push('/portafolio')
    }
  }, [status, sessionError, router])

  if (status === 'loading') {
    return (
      <div className='flex h-screen items-center justify-center bg-[#0E1015]'>
        <div className='relative flex items-center justify-center'>
          <div className='h-16 w-16 animate-spin rounded-full border-4 border-[#25B161]/20 border-t-[#25B161]' />
          <Icon icon='solar:graph-up-bold-duotone' className='absolute text-xl text-[#25B161] animate-pulse' />
        </div>
      </div>
    )
  }

  return (
    <div className='relative flex h-screen w-screen items-center justify-center bg-[#0E1015] p-4 overflow-hidden'>
      {/* Background Gradient Orbs */}
      <div className='absolute -left-1/4 -top-1/4 h-[80vw] w-[80vw] max-w-[800px] rounded-full bg-[#25B161]/5 blur-[120px] pointer-events-none' />
      <div className='absolute -right-1/4 -bottom-1/4 h-[80vw] w-[80vw] max-w-[800px] rounded-full bg-[#0f766e]/5 blur-[120px] pointer-events-none' />
      
      {/* Decorative Grid Overlay */}
      <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none' />

      <div className='relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-[#23282F]/80 bg-[#15181E]/75 p-8 sm:p-10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl'>
        {/* Subtle top border highlight glow */}
        <div className='absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#25B161]/40 to-transparent' />

        {/* Brand Header */}
        <div className='text-center mb-8'>
          <div className='inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#25B161]/20 to-[#10B981]/5 p-0.5 mb-5 shadow-[0_8px_20px_rgba(37,177,97,0.15)] border border-[#25B161]/25 relative group'>
            <div className='absolute inset-0 rounded-2xl bg-[#25B161]/10 blur-md opacity-50 group-hover:opacity-100 transition-opacity' />
            <Icon icon='solar:graph-up-bold-duotone' className='text-3xl text-[#25B161] relative z-10' />
          </div>
          <h1 className='text-3xl font-extrabold tracking-tight text-[#E6EBF0]'>
            Broker App
          </h1>
          <p className='mt-2 text-sm text-[#75808F]'>
            Accede a tu panel de inversiones en tiempo real
          </p>
        </div>

        {/* Content body */}
        <div className='space-y-6'>
          <div className='text-center'>
            <h2 className='text-base font-semibold text-[#8EA2BF]'>
              Inicia sesión para continuar
            </h2>
          </div>

          {authError || sessionError ? (
            <div className='flex items-start gap-3 rounded-2xl border border-[#4A2323] bg-[#2A1717]/60 px-4 py-3 text-left text-sm text-[#FFB3B1] backdrop-blur-sm'>
              <Icon icon='lucide:alert-circle' className='text-lg shrink-0 mt-0.5' />
              <span>
                {sessionError ||
                  authMessage ||
                  `No se pudo iniciar sesión con Google (${authError}).`}
              </span>
            </div>
          ) : null}

          {/* Social Sign-In Button */}
          <button
            onClick={() => signIn('google')}
            className='group relative flex w-full items-center justify-center gap-3.5 rounded-2xl border border-[#23282F] bg-[#0E1015] px-6 py-4 text-[#E6EBF0] transition-all duration-300 hover:border-[#25B161]/50 hover:bg-[#1A1E26] hover:shadow-[0_0_24px_rgba(37,177,97,0.15)] active:scale-[0.98] cursor-pointer'
          >
            <Icon icon='logos:google-icon' className='text-2xl' />
            <span className='font-semibold text-sm tracking-wide'>
              Continuar con Google
            </span>
          </button>

          {/* Remember me & Help Options (Visual enhancements) */}
          <div className='flex items-center justify-between text-xs pt-1'>
            <label className='flex items-center gap-2 text-[#75808F] cursor-pointer select-none hover:text-[#8EA2BF] transition-colors'>
              <input 
                type='checkbox' 
                defaultChecked 
                className='h-4 w-4 rounded border-[#23282F] bg-[#0E1015] text-[#25B161] focus:ring-[#25B161]/25 focus:ring-offset-0 focus:outline-none accent-[#25B161]' 
              />
              <span>Mantener sesión</span>
            </label>
            <a href='#' className='text-[#25B161] hover:text-[#10B981] font-medium transition-colors'>
              ¿Necesitas ayuda?
            </a>
          </div>

          {/* SSL Lock Security Badge */}
          <div className='flex items-center justify-center gap-2 rounded-xl bg-[#0E1015]/50 border border-[#23282F]/50 py-2.5 px-4 text-[11px] text-[#75808F]'>
            <Icon icon='solar:shield-keyhole-bold' className='text-sm text-[#25B161]' />
            <span className='font-medium'>Conexión encriptada SSL de grado bancario</span>
          </div>

          <p className='text-center text-[11px] text-[#75808F]/80 leading-relaxed max-w-[280px] mx-auto pt-2 border-t border-[#23282F]/50'>
            Al continuar, aceptas nuestros{' '}
            <a href='#' className='underline hover:text-[#E6EBF0] transition-colors'>Términos de Servicio</a> y{' '}
            <a href='#' className='underline hover:text-[#E6EBF0] transition-colors'>Política de Privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
