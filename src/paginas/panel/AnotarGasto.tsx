import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircleIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { Campo } from '@/paginas/acceso'
import { ErrorApi } from '@/services/api'
import { Boton } from '@/ui/Boton'
import { aMontoDelBackend, conSimbolo } from '@/utils/moneda'
import { useAppStore } from '@/stores/useAppStore'
import type { Categoria } from '@/types'

/** Hoy en formato "2026-08-31", que es lo que el backend espera. */
function hoy(): string {
  const d = new Date()
  const dosDigitos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}

/**
 * Aplana el árbol de categorías a las hojas elegibles.
 *
 * El catálogo llega en dos niveles —"Alimentación" con "Supermercado",
 * "Restaurantes"…— y se anota al nivel más fino que exista. Un padre sin hijos
 * (como "Otros gastos") sí es elegible; uno con hijos no, porque elegirlo
 * dejaría el gasto sin la precisión que el reparto por categoría necesita.
 */
function hojas(categorias: Categoria[]): { id: string; nombre: string; padre?: string }[] {
  const salida: { id: string; nombre: string; padre?: string }[] = []
  for (const c of categorias) {
    const hijos = c.children ?? []
    if (hijos.length === 0) salida.push({ id: c.id, nombre: c.name })
    else for (const h of hijos) salida.push({ id: h.id, nombre: h.name, padre: c.name })
  }
  return salida
}

/** Lo que tarda el popup en cerrarse solo tras anotar. */
const SEGUNDOS_PARA_CERRAR = 4

const foco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco'

/**
 * Anotar un gasto: la acción principal del producto.
 *
 * Es el contenido del popup, no una pantalla: anotar interrumpe lo que estabas
 * mirando y te devuelve ahí mismo al terminar. El título lo pone el diálogo que
 * lo envuelve.
 *
 * El orden de los campos es el del pensamiento: cuánto, de dónde salió, en qué
 * fue, cuándo. El monto va primero porque es lo único que la persona ya tiene
 * en la cabeza cuando abre esto.
 */
export function AnotarGasto({ onCerrar }: { onCerrar: () => void }) {
  const bolsillos = useAppStore((e) => e.bolsillos)
  const cargarBolsillos = useAppStore((e) => e.cargarBolsillos)
  const categorias = useAppStore((e) => e.categorias)
  const cargarCategorias = useAppStore((e) => e.cargarCategorias)
  const errorCategorias = useAppStore((e) => e.errorCategorias)
  const anotar = useAppStore((e) => e.anotar)
  const anotando = useAppStore((e) => e.anotando)
  const cargarDashboard = useAppStore((e) => e.cargarDashboard)
  const abrirCrearBolsillo = useAppStore((e) => e.abrirCrearBolsillo)

  const [monto, setMonto] = useState('')
  const [bolsillo, setBolsillo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [nota, setNota] = useState('')
  const [errores, setErrores] = useState<{ monto?: string; bolsillo?: string; categoria?: string }>(
    {},
  )
  const [aviso, setAviso] = useState<string | null>(null)
  const [hecho, setHecho] = useState<string | null>(null)
  /*
    Segundos que faltan para que el popup se cierre solo tras anotar. Empieza
    en 4 y se ve bajar: un diálogo que desaparece sin avisar deja a la persona
    preguntándose si guardó. `null` significa que no hay cuenta atrás corriendo
    —porque no se ha anotado nada, o porque se pulsó "Anotar otro".
  */
  const [restan, setRestan] = useState<number | null>(null)

  useEffect(() => {
    void cargarBolsillos()
    void cargarCategorias()
  }, [cargarBolsillos, cargarCategorias])

  /*
    La cuenta atrás para cerrar solo.

    El cierre es UN temporizador de 4 s, y el número que baja es un intervalo
    aparte. Antes los dos vivían en un `setTimeout` encadenado que dependía de
    `restan`: el efecto se reconstruía en cada tick y el temporizador del último
    segundo se cancelaba antes de cumplirse, así que la cuenta se quedaba
    clavada en "1 s" y el popup no se cerraba nunca.

    La dependencia es `contando` —un booleano— y no `restan`: así el efecto se
    monta una vez al arrancar la cuenta y se desmonta al pararla, en vez de
    rehacerse cada segundo.
  */
  const contando = restan !== null

  useEffect(() => {
    if (!contando) return

    const tic = window.setInterval(
      () => setRestan((n) => (n === null || n <= 1 ? n : n - 1)),
      1000,
    )
    const fin = window.setTimeout(onCerrar, SEGUNDOS_PARA_CERRAR * 1000)

    return () => {
      window.clearInterval(tic)
      window.clearTimeout(fin)
    }
  }, [contando, onCerrar])

  /** Vuelve al formulario en blanco y cancela el cierre automático. */
  const anotarOtro = useCallback(() => {
    setRestan(null)
    setHecho(null)
  }, [])

  // Con un solo bolsillo no hay nada que elegir: se preselecciona.
  useEffect(() => {
    if (!bolsillo && bolsillos.length === 1) setBolsillo(bolsillos[0].id)
  }, [bolsillos, bolsillo])

  const elegibles = useMemo(() => hojas(categorias), [categorias])

  const validar = () => {
    const fallos: typeof errores = {}
    if (!monto.trim()) fallos.monto = 'Escribe cuánto gastaste'
    else if (!/^\d{1,12}([.,]\d{1,2})?$/.test(monto.trim()))
      fallos.monto = 'Escribe un monto válido, por ejemplo 12,75'
    if (!bolsillo) fallos.bolsillo = 'Elige de qué bolsillo salió'
    if (!categoria) fallos.categoria = 'Elige en qué se fue'
    return fallos
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setAviso(null)

    const fallos = validar()
    setErrores(fallos)
    if (Object.keys(fallos).length > 0) return

    try {
      const mov = await anotar({
        type: 'expense',
        amount: aMontoDelBackend(monto),
        account_id: bolsillo,
        category_id: categoria,
        occurred_at: fecha,
        ...(nota.trim() ? { note: nota.trim() } : {}),
      })
      setHecho(conSimbolo(mov.amount))
      setRestan(SEGUNDOS_PARA_CERRAR)
      setMonto('')
      setCategoria('')
      setNota('')
      void cargarDashboard()
      void cargarBolsillos()
    } catch (error) {
      if (error instanceof ErrorApi && error.campos.length > 0) {
        setAviso(error.campos.map((c) => c.message).join('. '))
        return
      }
      setAviso(
        error instanceof Error ? error.message : 'No pudimos anotar el gasto. Inténtalo de nuevo.',
      )
    }
  }

  /*
    Sin bolsillos no hay dónde anotar: `account_id` es obligatorio. Va como
    alerta dentro del propio popup, con la salida a mano — cerrar el diálogo
    para descubrir por qué no se puede anotar sería un callejón.
  */
  if (bolsillos.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <div
          role="alert"
          className="flex items-start gap-3 rounded-extra bg-aviso-sutil px-5 py-4"
        >
          <WarningCircleIcon size={20} weight="fill" aria-hidden className="mt-0.5 text-aviso" />
          <p className="flex-1 text-cuerpo leading-relaxed text-texto-principal">
            Todavía no tienes bolsillos. Un bolsillo es el sitio de donde sale la plata —el
            efectivo, la cuenta del banco, la tarjeta—, y hace falta uno para poder anotar.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/*
            Encadena los dos diálogos en vez de navegar: cierra este y abre el
            de crear un bolsillo ahí mismo. Sin `to`, a propósito — `Boton`
            descarta `onClick` cuando recibe una ruta.
          */}
          <Boton
            onClick={() => {
              onCerrar()
              abrirCrearBolsillo()
            }}
          >
            Crear bolsillo
          </Boton>
          <Boton variante="secundario" onClick={onCerrar}>
            Ahora no
          </Boton>
        </div>
      </div>
    )
  }

  /*
    Anotado: el diálogo pasa a ser solo el acuse. El formulario desaparece en
    vez de quedarse debajo — si sigue ahí, la confirmación se lee como un aviso
    flotando sobre unos campos que ya no corresponden a nada, y no queda claro
    si hay que volver a enviar. Un diálogo, un estado.
  */
  if (hecho) {
    return (
      <div className="flex flex-col gap-6">
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-extra bg-ingreso-sutil px-6 py-8 text-center"
        >
          <CheckCircleIcon size={40} weight="fill" aria-hidden className="text-ingreso" />
          <p className="font-titulo text-titulo-menor font-bold text-texto-principal">
            Gasto anotado
          </p>
          <p className="text-cuerpo text-texto-secundario">
            {hecho} menos en tu bolsillo. Ya está en tu panel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Boton type="button" onClick={anotarOtro}>
            Anotar otro
          </Boton>
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cerrar
          </Boton>
          {restan !== null && (
            <p className="ml-auto text-nota text-texto-secundario tabular-nums">
              Se cierra en {restan} s
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <Campo
        id="monto-gasto"
        etiqueta="¿Cuánto?"
        placeholder="12,75"
        ayuda="Escríbelo seguido, sin puntos de miles: 1250,50."
        valor={monto}
        onCambio={setMonto}
        error={errores.monto}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bolsillo-gasto" className="text-nota font-medium text-texto-principal">
          ¿De qué bolsillo salió?
        </label>
        <select
          id="bolsillo-gasto"
          value={bolsillo}
          onChange={(e) => setBolsillo(e.target.value)}
          className={`h-11 rounded-grande border border-borde-fuerte bg-fondo-superficie px-3 text-cuerpo text-texto-principal outline-none ${foco}`}
        >
          <option value="">Elige uno</option>
          {bolsillos.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} · {conSimbolo(b.balance)}
            </option>
          ))}
        </select>
        <p className="text-micro text-texto-tenue">
          {errores.bolsillo ? (
            <span className="text-gasto">{errores.bolsillo}</span>
          ) : (
            'El saldo de ese bolsillo baja al guardar.'
          )}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="categoria-gasto" className="text-nota font-medium text-texto-principal">
          ¿En qué se fue?
        </label>
        <select
          id="categoria-gasto"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={`h-11 rounded-grande border border-borde-fuerte bg-fondo-superficie px-3 text-cuerpo text-texto-principal outline-none ${foco}`}
        >
          <option value="">Elige una</option>
          {elegibles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.padre ? `${c.padre} · ${c.nombre}` : c.nombre}
            </option>
          ))}
        </select>
        <p className="text-micro text-texto-tenue">
          {errores.categoria ? (
            <span className="text-gasto">{errores.categoria}</span>
          ) : (
            'Es lo que alimenta el reparto de "En qué se fue".'
          )}
        </p>
      </div>

      <Campo
        id="fecha-gasto"
        etiqueta="¿Cuándo?"
        tipo="date"
        placeholder=""
        ayuda="Hoy, salvo que lo estés poniendo al día."
        valor={fecha}
        onCambio={setFecha}
      />

      <Campo
        id="nota-gasto"
        etiqueta="Nota"
        placeholder="Almuerzo con Ana"
        ayuda="Opcional. Para reconocerlo dentro de un mes."
        valor={nota}
        onCambio={setNota}
      />

      {(aviso || errorCategorias) && (
        <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto">
          {aviso ?? errorCategorias}
        </p>
      )}

      <Boton type="submit" disabled={anotando} className="w-full">
        {anotando ? 'Anotando…' : 'Anotar el gasto'}
      </Boton>
    </form>
  )
}
