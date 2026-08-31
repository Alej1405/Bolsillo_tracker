import { BarraNav } from '@/layout/landing/BarraNav'
import { Fondo } from '@/layout/landing/Fondo'
import { Hero } from '@/paginas/landing/secciones/Hero'
import { SeccionQueEs } from '@/paginas/landing/secciones/SeccionQueEs'
import { SeccionQueHace } from '@/paginas/landing/secciones/SeccionQueHace'
import { SeccionBolsillos } from '@/paginas/landing/secciones/SeccionBolsillos'
import { SeccionComoFunciona } from '@/paginas/landing/secciones/SeccionComoFunciona'
import { SeccionTikToks } from '@/paginas/landing/secciones/SeccionTikToks'
import { SeccionContacto } from '@/paginas/landing/secciones/SeccionContacto'
import { SeccionRegistro } from '@/paginas/landing/secciones/SeccionRegistro'
import { PieDePagina } from '@/layout/landing/PieDePagina'

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
        <SeccionContacto />
        <SeccionRegistro />
      </main>

      <PieDePagina />
    </div>
  )
}
