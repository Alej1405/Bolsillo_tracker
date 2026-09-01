import { useEffect, useMemo, useState } from 'react'
import { Campo } from '@/paginas/acceso'
import { ErrorApi } from '@/services/api'
import { obtenerMovimiento } from '@/services/MovimientosService'
import { etiquetaDeCategoria, hojasDeCategorias, selector } from '@/helpers'
import { Boton } from '@/ui/Boton'
import { aMontoDelBackend } from '@/utils/moneda'
import { useAppStore } from '@/stores/useAppStore'
import type { MovimientoCompleto, TipoAnotable } from '@/types'

/**
 * Corregir un movimiento ya anotado.
 *
 * El tipo no se toca, y no es una limitación de la pantalla sino del contrato:
 * `PATCH /transactions/{id}` no acepta `type` a propósito —un gasto no se
 * convierte en ingreso editándolo—. Si alguien se equivocó de tipo, lo que
 * corresponde es borrarlo y anotarlo de nuevo, y así se lo decimos.
 *
 * Los datos se piden al servidor en vez de reaprovechar la fila de la lista:
 * la fila trae el monto ya formateado para leerlo ("− $55,00") y los nombres
 * resueltos, no los identificadores que hace falta reenviar.
 */
export function EditarMovimiento({
  id,
  onListo,
  onCerrar,
}: {
  id: string
  onListo: () => void
  onCerrar: () => void
}) {
  const bolsillos = useAppStore((e) => e.bolsillos)
  const cargarBolsillos = useAppStore((e) => e.cargarBolsillos)
  const categorias = useAppStore((e) => e.categorias)
  const cargarCategorias = useAppStore((e) => e.cargarCategorias)
  const editarMovimiento = useAppStore((e) => e.editarMovimiento)

  const [original, setOriginal] = useState<MovimientoCompleto | null>(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)

  const [monto, setMonto] = useState('')
  const [bolsillo, setBolsillo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fecha, setFecha] = useState('')
  const [nota, setNota] = useState('')

  const esTransferencia = original?.type === 'transfer'

  /*
    Se trae el movimiento y se rellena el formulario con lo que ya tenía.

    `cargando` arranca en `true` y aquí no se vuelve a poner: el formulario se
    monta de nuevo con cada movimiento —vive dentro del diálogo, que se cierra
    al terminar—, así que este efecto corre una sola vez por `id`.
  */
  useEffect(() => {
    let vigente = true
    obtenerMovimiento(id)
      .then((m) => {
        if (!vigente) return
        setOriginal(m)
        /* El monto llega como "55.00" y aquí se escribe con coma decimal. */
        setMonto(m.amount.replace('.', ','))
        setBolsillo(m.account.id)
        setCategoria(m.category?.id ?? '')
        setFecha(m.occurred_at)
        setNota(m.note ?? '')
      })
      .catch((error) =>
        setAviso(error instanceof Error ? error.message : 'No pudimos cargar el movimiento.'),
      )
      .finally(() => vigente && setCargando(false))
    return () => {
      vigente = false
    }
  }, [id])

  useEffect(() => {
    void cargarBolsillos()
  }, [cargarBolsillos])

  /* El catálogo depende del tipo, y una transferencia no lleva categoría. */
  useEffect(() => {
    if (original && !esTransferencia) void cargarCategorias(original.type as TipoAnotable)
  }, [original, esTransferencia, cargarCategorias])

  const elegibles = useMemo(
    () => hojasDeCategorias(original && !esTransferencia ? categorias[original.type as TipoAnotable] : []),
    [categorias, original, esTransferencia],
  )

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setAviso(null)

    const importe = aMontoDelBackend(monto)
    if (!importe || Number(importe) <= 0) {
      setAviso('Escribe un monto mayor que cero.')
      return
    }

    setGuardando(true)
    try {
      /*
        Se manda todo lo editable, no solo lo que cambió: el PATCH es parcial
        y tolera campos repetidos, y comparar campo a campo aquí sería otra
        copia de la verdad que puede desincronizarse.
      */
      await editarMovimiento(id, {
        amount: importe,
        account_id: bolsillo,
        occurred_at: fecha,
        note: nota.trim() || null,
        ...(esTransferencia ? {} : { category_id: categoria }),
      })
      onListo()
    } catch (error) {
      if (error instanceof ErrorApi && error.campos.length > 0) {
        setAviso(error.campos.map((c) => c.message).join('. '))
        return
      }
      setAviso(error instanceof Error ? error.message : 'No pudimos guardar el cambio.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <p className="py-6 text-center text-cuerpo text-texto-secundario">Cargando…</p>
  }

  if (!original) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto">
          {aviso ?? 'No pudimos cargar el movimiento.'}
        </p>
        <Boton type="button" variante="secundario" onClick={onCerrar}>
          Cerrar
        </Boton>
      </div>
    )
  }

  return (
    <form onSubmit={guardar} className="flex flex-col gap-5">
      <Campo
        id="editar-monto"
        etiqueta="¿Cuánto?"
        placeholder="12,75"
        ayuda="Con coma para los centavos, como 12,75"
        valor={monto}
        onCambio={setMonto}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="editar-bolsillo" className="text-nota font-medium text-texto-principal">
          ¿De qué bolsillo?
        </label>
        <select
          id="editar-bolsillo"
          value={bolsillo}
          onChange={(e) => setBolsillo(e.target.value)}
          className={`${selector} w-full`}
        >
          {bolsillos.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Una transferencia no tiene categoría: no hay catálogo que ofrecer. */}
      {!esTransferencia && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="editar-categoria" className="text-nota font-medium text-texto-principal">
            ¿En qué?
          </label>
          <select
            id="editar-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={`${selector} w-full`}
          >
            {elegibles.map((c) => (
              <option key={c.id} value={c.id}>
                {etiquetaDeCategoria(c)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="editar-fecha" className="text-nota font-medium text-texto-principal">
          ¿Cuándo?
        </label>
        <input
          id="editar-fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className={`${selector.replace('appearance-none pr-9', '')} w-full`}
        />
      </div>

      <Campo
        id="editar-nota"
        etiqueta="Nota"
        placeholder="Para acordarte después"
        ayuda="Opcional"
        valor={nota}
        onCambio={setNota}
      />

      {/*
        El tipo no se puede cambiar y hay que decirlo: sin esta línea, quien
        se equivocó de tipo busca el control hasta rendirse.
      */}
      <p className="rounded-grande bg-fondo-sutil px-4 py-3 text-nota leading-relaxed text-texto-secundario">
        Esto es{' '}
        <strong className="font-semibold">
          {original.type === 'expense' ? 'un gasto' : original.type === 'income' ? 'un ingreso' : 'una transferencia'}
        </strong>{' '}
        y eso no se cambia aquí. Si te equivocaste de tipo, bórralo y anótalo de nuevo.
      </p>

      {aviso && (
        <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto">
          {aviso}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Boton type="button" variante="secundario" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </Boton>
      </div>
    </form>
  )
}
