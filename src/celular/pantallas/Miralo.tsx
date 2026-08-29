import { PlayIcon } from '@phosphor-icons/react'
import { Pantalla } from '@/celular/Pantalla'
import { pasos } from '@/datos'

// Tres espacios listos para incrustar los videos de TikTok desde el código.
const videos = [0.3, 0.5, 0.7]

/**
 * La prueba y los pasos. En escritorio los videos van en fila de tres; aquí
 * en carrusel horizontal, que es como se hojea en un teléfono, con
 * `snap` para que cada video quede encuadrado solo.
 */
export function Miralo() {
  return (
    <Pantalla titulo="Míralo funcionando" entradilla="Un minuto por video. Sin manual, sin curso.">
      <div className="flex flex-col gap-10">
        {/* Carrusel a sangre: se sale del padding de la pantalla a propósito,
            para que se vea que hay más videos a la derecha. */}
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2">
          {videos.map((posicion, i) => (
            <div
              key={i}
              className="relative aspect-[9/16] w-[230px] shrink-0 snap-center overflow-hidden rounded-extra border border-white/60"
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
                className="absolute top-1/2 left-1/2 grid size-[62px] bg-fondo-superficie/90 backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fondo-superficie active:scale-95"
              >
                <PlayIcon size={24} weight="fill" className="ml-0.5 text-lavanda-950" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <h2 className="font-titulo text-rotulo font-bold text-texto-principal">
            Empezar toma tres minutos
          </h2>

          <ol className="vidrio mt-5 flex flex-col rounded-extra px-5">
            {pasos.map((p, i) => (
              <li
                key={p.titulo}
                className={`flex flex-col gap-2 py-5 ${
                  i < pasos.length - 1 ? 'border-b border-borde-sutil' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="size-2.5 shrink-0 rounded-full bg-accion-principal" />
                  <h3 className="font-titulo text-cuerpo-amplio font-bold text-texto-principal">
                    {p.titulo}
                  </h3>
                </div>
                <p className="pl-[22px] text-cuerpo leading-relaxed text-texto-secundario">
                  {p.cuerpo}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Pantalla>
  )
}
