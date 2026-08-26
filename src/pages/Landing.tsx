import { BarraNav } from '@/components/BarraNav'
import { Fondo } from '@/components/Fondo'
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
      <Fondo />

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
