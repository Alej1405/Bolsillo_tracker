import { useEffect } from 'react'
import { PlayIcon } from '@phosphor-icons/react'
import { Revelar } from '@/movimiento'
import { videos as marcadores } from '@/datos'
import { useAppStore } from '@/stores/useAppStore'
import type { Video } from '@/types'

/*
  La sección de TikToks.

  Muestra los vídeos reales de la cuenta cuando los hay, y si no, los tres
  marcadores de siempre. No es un adorno: mientras TikTok no esté conectado la
  sección tiene que seguir en pie, y una web con tres huecos vacíos se ve peor
  que una con tres marcadores.

  Los vídeos salen del backend, que los guardó al sincronizar. No se le pregunta
  a TikTok en cada visita: esta página la ve cualquiera y su API tiene límites de
  uso, así que mil visitas serían mil llamadas por el mismo dato.
*/

/** Un vídeo real: su portada, y al pulsar se abre en TikTok. */
function VideoReal({ video }: { video: Video }) {
  return (
    <a
      href={video.share_url ?? '#'}
      target="_blank"
      rel="noopener noreferrer"
      title={video.title ?? 'Ver en TikTok'}
      className="group relative block aspect-[9/16] w-[280px] overflow-hidden rounded-extra shadow-[0_26px_60px_-20px_color-mix(in_srgb,var(--color-lavanda-900)_45%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-borde-foco"
    >
      {video.cover_url ? (
        <img
          src={video.cover_url}
          loading="lazy"
          decoding="async"
          alt=""
          className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-lavanda-200" />
      )}

      <div className="absolute inset-0 bg-lavanda-950/40" />

      <span className="vidrio absolute top-1/2 left-1/2 grid size-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform group-hover:scale-105">
        <PlayIcon size={26} weight="fill" className="ml-0.5 text-lavanda-950" />
      </span>

      {/*
        El título va sobre un degradado y no sobre la foto pelada: una portada
        clara dejaría el texto ilegible, y no se sabe qué portada tocará.
      */}
      {video.title && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-lavanda-950/90 to-transparent p-4 text-nota leading-snug text-texto-inverso">
          <span className="line-clamp-2">{video.title}</span>
        </span>
      )}
    </a>
  )
}

/** El marcador de siempre, mientras no haya vídeos de verdad. */
function Marcador({ posicion, indice }: { posicion: number; indice: number }) {
  return (
    <div
      className="relative aspect-[9/16] w-[280px] overflow-hidden rounded-extra shadow-[0_26px_60px_-20px_color-mix(in_srgb,var(--color-lavanda-900)_45%,transparent)]"
      data-video-tiktok={indice + 1}
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
        aria-label={`Reproducir video ${indice + 1}`}
        className="vidrio absolute top-1/2 left-1/2 grid size-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform hover:scale-105"
      >
        <PlayIcon size={26} weight="fill" className="ml-0.5 text-lavanda-950" />
      </button>
    </div>
  )
}

export function SeccionTikToks() {
  const videos = useAppStore((e) => e.videos)
  const cargarVideos = useAppStore((e) => e.cargarVideos)

  useEffect(() => {
    void cargarVideos(3)
  }, [cargarVideos])

  const hayVideos = videos.length > 0

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
          {hayVideos
            ? videos.map((v, i) => (
                <Revelar key={v.video_id} retraso={i * 0.1}>
                  <VideoReal video={v} />
                </Revelar>
              ))
            : marcadores.map((posicion, i) => (
                <Revelar key={i} retraso={i * 0.1}>
                  <Marcador posicion={posicion} indice={i} />
                </Revelar>
              ))}
        </div>
      </div>
    </section>
  )
}
