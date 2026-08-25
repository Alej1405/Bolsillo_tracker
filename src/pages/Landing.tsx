import { BarraNav } from '@/components/BarraNav'
import { Hero } from '@/components/Hero'
import { SeccionQueEs } from '@/components/SeccionQueEs'
import { SeccionQueHace } from '@/components/SeccionQueHace'
import { SeccionBolsillos } from '@/components/SeccionBolsillos'
import { SeccionComoFunciona } from '@/components/SeccionComoFunciona'
import { SeccionTikToks } from '@/components/SeccionTikToks'
import { SeccionRegistro } from '@/components/SeccionRegistro'
import { PieDePagina } from '@/components/PieDePagina'

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Fondo atmosférico: degradado lavanda + orbes desenfocadas.
          Es lo que da materia al vidrio de las secciones. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, #f0edf9 0%, #e0dbf2 30%, #d0cbe8 60%, #c1b8de 85%, #b1a6d4 100%)',
        }}
      >
        <div className="absolute -left-40 top-[8%] size-[560px] rounded-full bg-lavanda-600/70 blur-[190px]" />
        <div className="absolute -right-40 top-[28%] size-[520px] rounded-full bg-lavanda-800/60 blur-[190px]" />
        <div className="absolute -left-32 top-[52%] size-[480px] rounded-full bg-lavanda-700/60 blur-[190px]" />
        <div className="absolute left-1/3 top-[70%] size-[520px] rounded-full bg-lavanda-500/70 blur-[190px]" />
        <div className="absolute right-1/4 top-[86%] size-[460px] rounded-full bg-lavanda-900/50 blur-[190px]" />
      </div>

      <BarraNav />

      <main>
        <Hero />
        <SeccionQueEs />
        <SeccionQueHace />
        <SeccionBolsillos />
        <SeccionComoFunciona />
        <SeccionTikToks />
        <SeccionRegistro />
      </main>

      <PieDePagina />
    </div>
  )
}
