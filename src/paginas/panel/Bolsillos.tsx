import { useEffect, useState } from 'react'
import { CheckCircleIcon, PlusIcon } from '@phosphor-icons/react'
import { FormularioBolsillo } from '@/paginas/panel/FormularioBolsillo'
import { TarjetaBolsilloPanel } from '@/piezas'
import { ErrorApi } from '@/services/api'
import { Boton } from '@/ui/Boton'
import { Modal } from '@/ui/Modal'
import { conSimbolo } from '@/utils/moneda'
import { useAppStore } from '@/stores/useAppStore'
import type { Cuenta } from '@/types'

/** Qué diálogo está abierto. `null` es ninguno. */
type Dialogo =
  | { tipo: 'editar'; bolsillo: Cuenta }
  | { tipo: 'borrar'; bolsillo: Cuenta }
  | null


/**
 * Pantalla de bolsillos: crear, ver, editar, archivar y borrar.
 *
 * Archivar y borrar son dos cosas distintas y las dos hacen falta. El backend
 * se niega a borrar un bolsillo con movimientos —responde 409— porque eso
 * borraría historia; archivar lo saca del patrimonio y de las listas pero
 * conserva lo que pasó. Cuando el borrado falla por eso, el diálogo ofrece
 * archivar en vez de dejar a la persona sin salida.
 */
export function Bolsillos() {
  const bolsillos = useAppStore((e) => e.bolsillos)
  const patrimonio = useAppStore((e) => e.patrimonio)
  const cargando = useAppStore((e) => e.cargandoBolsillos)
  const error = useAppStore((e) => e.errorBolsillos)
  const ocupado = useAppStore((e) => e.guardandoBolsillo)
  const cargar = useAppStore((e) => e.cargarBolsillos)
  const archivar = useAppStore((e) => e.archivarBolsillo)
  const desarchivar = useAppStore((e) => e.desarchivarBolsillo)
  const borrar = useAppStore((e) => e.borrarBolsillo)
  const cargarDashboard = useAppStore((e) => e.cargarDashboard)
  const abrirCrearBolsillo = useAppStore((e) => e.abrirCrearBolsillo)

  const [verArchivados, setVerArchivados] = useState(false)
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null)

  useEffect(() => {
    void cargar(verArchivados)
  }, [cargar, verArchivados])

  /* Tras cualquier cambio, el panel de inicio también deja de estar al día. */
  const refrescarTodo = () => void cargarDashboard()

  const cerrar = () => {
    setDialogo(null)
    setErrorBorrado(null)
  }

  const alGuardar = (nombre: string, creado: boolean) => {
    cerrar()
    setAviso(creado ? `Listo, «${nombre}» ya es uno de tus bolsillos.` : `Guardamos «${nombre}».`)
    refrescarTodo()
  }

  const alArchivar = async (bolsillo: Cuenta) => {
    setAviso(null)
    try {
      await archivar(bolsillo.id)
      setAviso(`«${bolsillo.name}» quedó archivado. Ya no cuenta en tu patrimonio.`)
      refrescarTodo()
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No pudimos archivar el bolsillo.')
    }
  }

  const alDesarchivar = async (bolsillo: Cuenta) => {
    setAviso(null)
    try {
      /* Se pasa `verArchivados` para que la lista no se vacíe bajo el cursor. */
      await desarchivar(bolsillo.id, verArchivados)
      setAviso(`«${bolsillo.name}» volvió. Ya cuenta otra vez en tu patrimonio.`)
      refrescarTodo()
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No pudimos desarchivar el bolsillo.')
    }
  }

  const alBorrar = async (bolsillo: Cuenta) => {
    setErrorBorrado(null)
    try {
      await borrar(bolsillo.id)
      cerrar()
      setAviso(`Borramos «${bolsillo.name}».`)
      refrescarTodo()
    } catch (e) {
      /*
        409 IN_USE: tiene movimientos. No es un fallo que se pueda reintentar,
        así que el diálogo cambia de propuesta en vez de repetir el error.
      */
      if (e instanceof ErrorApi && e.estado === 409) {
        setErrorBorrado(
          'Este bolsillo tiene movimientos registrados, así que no se puede borrar sin perder esa historia. Archívalo: deja de contar en tu patrimonio y conserva lo que pasó.',
        )
        return
      }
      setErrorBorrado(e instanceof Error ? e.message : 'No pudimos borrar el bolsillo.')
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-5">
      <div className="vidrio flex flex-wrap items-center gap-4 rounded-maximo p-5">
        <div className="flex flex-1 flex-col gap-1">
          <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">
            Tus bolsillos
          </h2>
          <p className="text-nota text-texto-tenue">
            {cargando
              ? 'Cargando…'
              : bolsillos.length === 0
                ? 'Todavía no tienes ninguno. Crea el primero para empezar a registrar.'
                : `${bolsillos.length} ${bolsillos.length === 1 ? 'bolsillo' : 'bolsillos'}${
                    patrimonio ? ` · ${conSimbolo(patrimonio)} en total` : ''
                  }`}
          </p>
        </div>

        <label className="flex min-h-11 items-center gap-2 text-nota text-texto-secundario">
          <input
            type="checkbox"
            checked={verArchivados}
            onChange={(e) => setVerArchivados(e.target.checked)}
            className="size-4 accent-accion-principal"
          />
          Ver archivados
        </label>

        <Boton onClick={abrirCrearBolsillo}>
          <PlusIcon size={18} weight="bold" aria-hidden />
          Crear bolsillo
        </Boton>
      </div>

      {aviso && (
        <p
          role="status"
          className="flex items-center gap-3 rounded-extra bg-ingreso-sutil px-5 py-4 text-cuerpo text-texto-principal"
        >
          <CheckCircleIcon size={20} weight="fill" aria-hidden className="text-ingreso" />
          {aviso}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-3 rounded-extra bg-gasto-sutil px-5 py-4"
        >
          <p className="flex-1 text-cuerpo text-texto-principal">{error}</p>
          <Boton variante="secundario" onClick={() => void cargar(verArchivados)}>
            Reintentar
          </Boton>
        </div>
      )}

      {cargando ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[168px] animate-pulse rounded-extra bg-fondo-superficie/60" />
          ))}
        </div>
      ) : bolsillos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bolsillos.map((b) => (
            <TarjetaBolsilloPanel
              key={b.id}
              bolsillo={b}
              ocupado={ocupado}
              onEditar={() => setDialogo({ tipo: 'editar', bolsillo: b })}
              onArchivar={() => void alArchivar(b)}
              onDesarchivar={() => void alDesarchivar(b)}
              onBorrar={() => setDialogo({ tipo: 'borrar', bolsillo: b })}
            />
          ))}
        </div>
      ) : (
        !error && (
          <p className="rounded-extra border border-dashed border-borde-fuerte px-5 py-10 text-center text-cuerpo text-texto-secundario">
            Un bolsillo es cada sitio donde tienes plata: el efectivo, la cuenta del banco, la
            tarjeta, el ahorro para un viaje. Crea el primero y ya puedes registrar movimientos.
          </p>
        )
      )}

      {/* Crear lo monta el armazón, para poder abrirlo también desde el popup
          de anotar un gasto. Aquí solo vive el de editar. */}
      <Modal abierto={dialogo?.tipo === 'editar'} onCerrar={cerrar} titulo="Editar bolsillo">
        {dialogo?.tipo === 'editar' && (
          <FormularioBolsillo
            bolsillo={dialogo.bolsillo}
            onListo={(nombre) => alGuardar(nombre, false)}
          />
        )}
      </Modal>

      <Modal abierto={dialogo?.tipo === 'borrar'} onCerrar={cerrar} titulo="Borrar bolsillo">
        {dialogo?.tipo === 'borrar' && (
          <div className="flex flex-col gap-5">
            <p className="text-cuerpo leading-relaxed text-texto-secundario">
              {errorBorrado ?? (
                <>
                  ¿Seguro que quieres borrar «
                  <strong className="font-semibold text-texto-principal">
                    {dialogo.bolsillo.name}
                  </strong>
                  »? Esto no se puede deshacer.
                </>
              )}
            </p>

            <div className="flex flex-wrap gap-3">
              {errorBorrado ? (
                <Boton
                  onClick={() => {
                    const b = dialogo.bolsillo
                    cerrar()
                    void alArchivar(b)
                  }}
                  disabled={ocupado}
                >
                  Archivarlo
                </Boton>
              ) : (
                <Boton
                  variante="peligro"
                  onClick={() => void alBorrar(dialogo.bolsillo)}
                  disabled={ocupado}
                >
                  {ocupado ? 'Borrando…' : 'Sí, borrarlo'}
                </Boton>
              )}
              <Boton variante="secundario" onClick={cerrar}>
                Cancelar
              </Boton>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
