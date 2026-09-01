import { ArchiveIcon, ArrowCounterClockwiseIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
import { etiquetaDe, iconoDe } from '@/paginas/panel/FormularioBolsillo'
import { Pista } from '@/ui/Pista'
import { conSimbolo, enContra } from '@/utils/moneda'
import type { Cuenta } from '@/types'

/*
  La tarjeta de un bolsillo dentro del panel: qué es, cuánto tiene y qué se
  puede hacer con él.

  No se unifica con `TarjetaBolsillo`, que es la de la landing: aquella muestra
  un ejemplo con textos sueltos y sin acciones; esta recibe una `Cuenta` del
  backend y ofrece editar, archivar, desarchivar y borrar. Comparten el aspecto,
  no el trabajo, y juntarlas obligaría a que la landing arrastrara props que no
  usa.
*/

/** El botón redondo de cada acción. Uno solo para las cuatro. */
const ACCION =
  'grid size-11 place-items-center rounded-medio border border-borde-fuerte bg-fondo-superficie text-texto-secundario transition-colors hover:bg-fondo-sutil focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none'

/** Una tarjeta de la lista: qué es, cuánto tiene y qué se puede hacer con él. */
export function TarjetaBolsilloPanel({
  bolsillo,
  onEditar,
  onArchivar,
  onDesarchivar,
  onBorrar,
  ocupado,
}: {
  bolsillo: Cuenta
  onEditar: () => void
  onArchivar: () => void
  onDesarchivar: () => void
  onBorrar: () => void
  ocupado: boolean
}) {
  const Icono = iconoDe(bolsillo.type)
  const archivado = Boolean(bolsillo.archived_at)
  const negativo = enContra(bolsillo.balance)

  return (
    <article
      className={`flex flex-col gap-4 rounded-extra bg-fondo-superficie p-5 ${
        archivado ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-medio bg-fondo-sutil text-texto-secundario">
          <Icono size={18} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          {/* `truncate`: los nombres los pone el usuario y pueden ser largos. */}
          <p className="truncate text-cuerpo font-semibold text-texto-principal">{bolsillo.name}</p>
          <p className="text-micro tracking-[0.08em] text-texto-tenue uppercase">
            {etiquetaDe(bolsillo.type)}
            {archivado && ' · archivado'}
          </p>
        </div>
      </div>

      <p
        className={`font-cuerpo text-titulo-menor font-bold tabular-nums ${
          negativo ? 'text-gasto' : 'text-texto-principal'
        }`}
      >
        {conSimbolo(bolsillo.balance)}
      </p>

      <div className="flex items-center gap-2">
        <Pista texto="Editar">
          <button type="button" onClick={onEditar} disabled={ocupado} className={ACCION}>
            <PencilSimpleIcon size={18} aria-hidden />
            <span className="sr-only">Editar {bolsillo.name}</span>
          </button>
        </Pista>

        {/* Archivar y desarchivar son el mismo sitio: nunca aplican los dos. */}
        {archivado ? (
          <Pista texto="Desarchivar">
            <button type="button" onClick={onDesarchivar} disabled={ocupado} className={ACCION}>
              <ArrowCounterClockwiseIcon size={18} aria-hidden />
              <span className="sr-only">Desarchivar {bolsillo.name}</span>
            </button>
          </Pista>
        ) : (
          <Pista texto="Archivar">
            <button type="button" onClick={onArchivar} disabled={ocupado} className={ACCION}>
              <ArchiveIcon size={18} aria-hidden />
              <span className="sr-only">Archivar {bolsillo.name}</span>
            </button>
          </Pista>
        )}

        <Pista texto="Borrar">
          <button
            type="button"
            onClick={onBorrar}
            disabled={ocupado}
            className={`${ACCION} hover:border-gasto hover:text-gasto`}
          >
            <TrashIcon size={18} aria-hidden />
            <span className="sr-only">Borrar {bolsillo.name}</span>
          </button>
        </Pista>
      </div>
    </article>
  )
}
