import { PlayIcon } from '@phosphor-icons/react'
import { Revelar } from '@/movimiento'

// Tres espacios listos para incrustar los videos de TikTok desde el código.
const videos = [0.3, 0.5, 0.7]

export function SeccionTikToks() {
  return (
    <section id="tiktoks" className="seccion py-24">
      <div className="contenedor flex flex-col items-center gap-10">
        <Revelar className="text-center">
          <h2 className="font-titulo text-portada font-bold text-texto-principal">
            Nuestros Usuarios.
          </h2>
          <p className="mt-3 text-cuerpo-amplio text-texto-secundario">
            La muestra que algo simple puede mejorar tu economía.
          </p>
        </Revelar>

        <div className="flex flex-wrap justify-center gap-7">
          {videos.map((posicion, i) => (
            <Revelar key={i} retraso={i * 0.1}>
              {/* Marcador para incrustar el video de TikTok N */}
              <div
                className="relative aspect-[9/16] w-[280px] overflow-hidden rounded-extra  shadow-[0_26px_60px_-20px_color-mix(in_srgb,var(--color-lavanda-900)_45%,transparent)]"
                data-video-tiktok={i + 1}
              >
                <img
                  src="/hero-480.webp"
                  loading="lazy"
                  decoding="async"
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  style={{ objectPosition: `${posicion * 100}% 40%` }}
                />
                <div className="absolute inset-0 bg-lavanda-950/40" />
                <button
                  type="button"
                  aria-label={`Reproducir video ${i + 1}`}
                  className="vidrio absolute left-1/2 top-1/2 grid size-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform hover:scale-105"
                >
                  <PlayIcon size={26} weight="fill" className="ml-0.5 text-lavanda-950" />
                </button>
              </div>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  )
}
