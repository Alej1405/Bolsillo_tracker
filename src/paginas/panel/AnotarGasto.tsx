import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { etiquetaDeCategoria, foco, hojasDeCategorias } from '@/helpers'
import { Campo } from '@/paginas/acceso'
import { ErrorApi } from '@/services/api'
import { Boton } from '@/ui/Boton'
import { aMontoDelBackend, conSimbolo } from '@/utils/moneda'
import { useAppStore } from '@/stores/useAppStore'
import type { TipoAnotable, TipoPopup } from '@/types'

/** Hoy en formato "2026-08-31", que es lo que el backend espera. */
function hoy(): string {
  const d = new Date()
  const dosDigitos = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`
}


/** Lo que tarda el popup en cerrarse solo tras anotar. */
const SEGUNDOS_PARA_CERRAR = 4

/*
  Lo único que distingue anotar un gasto de anotar un ingreso: las palabras.

  Los campos, la validación, el envío y la confirmación son idénticos —el
  backend recibe el mismo cuerpo con otro `type`—, así que en vez de dos
  formularios hay uno y esta tabla. Añadir un tipo nuevo sería una entrada más
  aquí, no otro archivo.

  Están escritas desde el punto de vista de la persona: en un gasto el dinero
  sale de un bolsillo y se va a algo; en un ingreso entra a un bolsillo y viene
  de algún sitio.
*/
const TEXTOS = {
  expense: {
    accion: 'Anotar el gasto',
    anotando: 'Anotando…',
    hecho: 'Gasto anotado',
    resultado: 'menos en tu bolsillo. Ya está en tu panel.',
    montoFalta: 'Escribe cuánto gastaste',
    bolsillo: '¿De qué bolsillo salió?',
    bolsilloFalta: 'Elige de qué bolsillo salió',
    categoria: '¿En qué se fue?',
    categoriaFalta: 'Elige en qué se fue',
    categoriaAyuda: 'Es lo que alimenta el reparto de "En qué se fue".',
    fallo: 'No pudimos anotar el gasto. Inténtalo de nuevo.',
  },
  /*
    Mover a ahorro no es dinero que entra ni que sale: es dinero que cambia de
    sitio. Por eso el tercer campo no es una categoría sino el bolsillo de
    destino, y por eso el resultado no dice "más" ni "menos" en el bolsillo.
  */
  transfer: {
    accion: 'Mover a ahorro',
    anotando: 'Moviendo…',
    hecho: 'Guardado en tu ahorro',
    resultado: 'movidos a tu bolsillo de ahorro.',
    montoFalta: 'Escribe cuánto quieres guardar',
    bolsillo: '¿De qué bolsillo sale?',
    bolsilloFalta: 'Elige de qué bolsillo sale',
    categoria: '¿A qué bolsillo de ahorro va?',
    categoriaFalta: 'Elige a qué bolsillo de ahorro va',
    categoriaAyuda: 'Solo lo que llega a un bolsillo de ahorro cuenta como ahorrado.',
    fallo: 'No pudimos mover el dinero. Inténtalo de nuevo.',
  },
  income: {
    accion: 'Anotar el ingreso',
    anotando: 'Anotando…',
    hecho: 'Ingreso anotado',
    resultado: 'más en tu bolsillo. Ya está en tu panel.',
    montoFalta: 'Escribe cuánto recibiste',
    bolsillo: '¿A qué bolsillo entró?',
    bolsilloFalta: 'Elige a qué bolsillo entró',
    categoria: '¿De dónde vino?',
    categoriaFalta: 'Elige de dónde vino',
    categoriaAyuda: 'Sirve para saber de dónde viene tu dinero.',
    fallo: 'No pudimos anotar el ingreso. Inténtalo de nuevo.',
  },
} as const


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
export function AnotarGasto({
  tipo,
  onCerrar,
}: {
  tipo: TipoPopup
  onCerrar: () => void
}) {
  /* Los textos del tipo que toca. Se calcula en el render, no es estado. */
  const texto = TEXTOS[tipo]
  /*
    Mover a ahorro es una transferencia: va a otro endpoint, no lleva categoría
    y su tercer campo es un bolsillo, no una categoría. Todo lo demás —monto,
    origen, fecha, nota— es igual, y por eso comparte formulario.
  */
  const esAhorro = tipo === 'transfer'

  const bolsillos = useAppStore((e) => e.bolsillos)
  const cargarBolsillos = useAppStore((e) => e.cargarBolsillos)
  const categorias = useAppStore((e) => e.categorias)[esAhorro ? 'expense' : tipo]
  const pasarPlata = useAppStore((e) => e.pasarPlata)
  /*
    A dónde va el ahorro. No se pregunta: quien pulsa "Mover a ahorro" ya dijo
    a dónde quiere que vaya, y volver a preguntarlo con un desplegable de una
    sola opción es trabajo que la pantalla puede hacer sola.

    Si hubiera varios bolsillos de ahorro se toma el primero. Elegir entre
    varios es otra conversación —y otro formulario—; esto resuelve el caso que
    existe hoy.
  */
  const bolsilloDeAhorro = bolsillos.find((b) => b.type === 'savings')
  const cargarCategorias = useAppStore((e) => e.cargarCategorias)
  const errorCategorias = useAppStore((e) => e.errorCategorias)
  const anotar = useAppStore((e) => e.anotar)
  const borrarMovimiento = useAppStore((e) => e.borrarMovimiento)
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
    Lo último anotado, para poder deshacerlo. El `POST` devuelve el movimiento
    entero, así que basta con quedarse su `id`: deshacer es un `DELETE` de los
    que ya existen, y en el backend es un borrado lógico —marca `deleted_at` y
    lo saca de saldos, historial y reportes— así que no hay nada que recalcular.
  */
  const [ultimo, setUltimo] = useState<string | null>(null)
  const [deshaciendo, setDeshaciendo] = useState(false)
  const [deshecho, setDeshecho] = useState(false)
  /*
    Segundos que faltan para que el popup se cierre solo tras anotar. Empieza
    en 4 y se ve bajar: un diálogo que desaparece sin avisar deja a la persona
    preguntándose si guardó. `null` significa que no hay cuenta atrás corriendo
    —porque no se ha anotado nada, o porque se pulsó "Anotar otro".
  */
  const [restan, setRestan] = useState<number | null>(null)

  /* El catálogo depende del tipo: las de gasto no sirven para un ingreso. */
  useEffect(() => {
    void cargarBolsillos()
    /* Una transferencia no lleva categoría: no hay catálogo que pedir. */
    if (!esAhorro) void cargarCategorias(tipo as TipoAnotable)
  }, [cargarBolsillos, cargarCategorias, tipo, esAhorro])

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
    setUltimo(null)
    setDeshecho(false)
  }, [])

  /*
    Deshacer lo que se acaba de anotar.

    Es la salida del error más común y más caro de la aplicación: escribir 55
    donde iban 5,50. Sin esto hay que salir del diálogo, ir al historial,
    encontrar el movimiento entre los demás y borrarlo ahí — cuatro pasos para
    arreglar uno.

    Para la cuenta atrás en cuanto se pulsa: el diálogo no puede cerrarse solo
    en mitad de una operación que la persona acaba de pedir.
  */
  const deshacer = useCallback(async () => {
    if (!ultimo) return
    setRestan(null)
    setDeshaciendo(true)
    setAviso(null)
    try {
      await borrarMovimiento(ultimo)
      setDeshecho(true)
      setUltimo(null)
      void cargarDashboard()
      void cargarBolsillos()
    } catch (error) {
      setAviso(
        error instanceof Error
          ? error.message
          : 'No pudimos deshacerlo. Puedes borrarlo desde el historial.',
      )
    } finally {
      setDeshaciendo(false)
    }
  }, [ultimo, borrarMovimiento, cargarDashboard, cargarBolsillos])

  // Con un solo bolsillo no hay nada que elegir: se preselecciona.
  useEffect(() => {
    if (!bolsillo && bolsillos.length === 1) setBolsillo(bolsillos[0].id)
  }, [bolsillos, bolsillo])

  const elegibles = useMemo(() => hojasDeCategorias(categorias), [categorias])

  const validar = () => {
    const fallos: typeof errores = {}
    if (!monto.trim()) fallos.monto = texto.montoFalta
    else if (!/^\d{1,12}([.,]\d{1,2})?$/.test(monto.trim()))
      fallos.monto = 'Escribe un monto válido, por ejemplo 12,75'
    if (!bolsillo) fallos.bolsillo = texto.bolsilloFalta
    /* Una transferencia no lleva categoría: ese campo no existe en ese modo. */
    if (!esAhorro && !categoria) fallos.categoria = texto.categoriaFalta
    /*
      Mover dinero al mismo bolsillo del que sale no es nada, y el backend lo
      rechaza con un CHECK. Se avisa antes de enviarlo para no gastar un viaje.
    */
    if (esAhorro && bolsillo && bolsillo === bolsilloDeAhorro?.id)
      fallos.bolsillo = 'Ese ya es tu bolsillo de ahorro: elige de dónde sacas la plata'
    return fallos
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setAviso(null)

    const fallos = validar()
    setErrores(fallos)
    if (Object.keys(fallos).length > 0) return

    try {
      const comun = {
        amount: aMontoDelBackend(monto),
        occurred_at: fecha,
        ...(nota.trim() ? { note: nota.trim() } : {}),
      }
      /*
        Dos endpoints distintos porque son operaciones distintas para el
        backend: `/transactions` con un tipo, o `/transfers` con dos cuentas.
        Aquí es lo único que se bifurca; el formulario ya se encargó de pedir
        los campos que hacen falta en cada caso.
      */
      const mov = esAhorro
        ? await pasarPlata({
            ...comun,
            from_account_id: bolsillo,
            to_account_id: bolsilloDeAhorro?.id ?? '',
          })
        : await anotar({
            ...comun,
            type: tipo as TipoAnotable,
            account_id: bolsillo,
            category_id: categoria,
          })
      setHecho(conSimbolo(mov.amount))
      setUltimo(mov.id)
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
        error instanceof Error ? error.message : texto.fallo,
      )
    }
  }

  /*
    Sin bolsillos no hay dónde anotar: `account_id` es obligatorio. Va como
    alerta dentro del propio popup, con la salida a mano — cerrar el diálogo
    para descubrir por qué no se puede anotar sería un callejón.
  */
  /*
    Mover a ahorro sin un bolsillo de ahorro no se puede: el destino no existe.
    Mismo patrón que la alerta de arriba —el problema, y la salida a mano— para
    no dejar un formulario que no puede enviarse.
  */
  if (esAhorro && !bolsilloDeAhorro) {
    return (
      <div className="flex flex-col gap-5">
        <div role="alert" className="flex items-start gap-3 rounded-extra bg-aviso-sutil px-5 py-4">
          <WarningCircleIcon size={20} weight="fill" aria-hidden className="mt-0.5 text-aviso" />
          <p className="flex-1 text-cuerpo leading-relaxed text-texto-principal">
            Todavía no tienes un bolsillo de ahorro. Crea uno de tipo{' '}
            <strong className="font-semibold">Ahorro</strong> y podrás mover ahí la plata que vayas
            guardando: es lo que cuenta como ahorrado en tus reportes.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Boton
            onClick={() => {
              onCerrar()
              abrirCrearBolsillo()
            }}
          >
            Crear bolsillo de ahorro
          </Boton>
          <Boton variante="secundario" onClick={onCerrar}>
            Ahora no
          </Boton>
        </div>
      </div>
    )
  }

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
  /*
    Deshecho: el acuse cambia de tono en vez de desaparecer. Si el diálogo se
    cerrara de golpe, la persona no sabría si el movimiento se quitó o si se
    quitó el aviso, y acabaría en el historial comprobándolo.
  */
  if (deshecho) {
    return (
      <div className="flex flex-col gap-6">
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-extra bg-fondo-sutil px-6 py-8 text-center"
        >
          <ArrowCounterClockwiseIcon size={40} weight="bold" aria-hidden className="text-texto-secundario" />
          <p className="font-titulo text-titulo-menor font-bold text-texto-principal">
            Lo deshicimos
          </p>
          <p className="text-cuerpo text-texto-secundario">
            Ese movimiento ya no cuenta en tus bolsillos ni en tus reportes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Boton type="button" onClick={anotarOtro}>
            Anotar de nuevo
          </Boton>
          <Boton type="button" variante="secundario" onClick={onCerrar}>
            Cerrar
          </Boton>
        </div>
      </div>
    )
  }

  if (hecho) {
    return (
      <div className="flex flex-col gap-6">
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-extra bg-ingreso-sutil px-6 py-8 text-center"
        >
          <CheckCircleIcon size={40} weight="fill" aria-hidden className="text-ingreso" />
          <p className="font-titulo text-titulo-menor font-bold text-texto-principal">
            {texto.hecho}
          </p>
          <p className="text-cuerpo text-texto-secundario">
            {hecho} {texto.resultado}
          </p>

          {/*
            El deshacer vive DENTRO del acuse, no entre los botones de abajo:
            es la respuesta a "me equivoqué" y tiene que estar donde se lee la
            cifra, que es lo que se mira para comprobar si está bien.
          */}
          {ultimo && (
            <button
              type="button"
              onClick={() => void deshacer()}
              disabled={deshaciendo}
              className={`mt-1 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-nota font-semibold text-texto-principal underline underline-offset-4 transition-colors hover:bg-fondo-superficie disabled:opacity-60 ${foco}`}
            >
              <ArrowCounterClockwiseIcon size={16} weight="bold" aria-hidden />
              {deshaciendo ? 'Deshaciendo…' : '¿Te equivocaste? Deshacer'}
            </button>
          )}
        </div>

        {aviso && (
          <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto">
            {aviso}
          </p>
        )}

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
          {texto.bolsillo}
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

      {/*
        El tercer campo solo existe cuando hay algo que elegir. Al mover a
        ahorro el destino no se pregunta: se dice a dónde va y ya está.
      */}
      {esAhorro ? (
        <p className="rounded-medio bg-fondo-sutil px-4 py-3 text-nota text-texto-secundario">
          Va a <strong className="font-semibold">{bolsilloDeAhorro?.name}</strong>, tu bolsillo de
          ahorro. {texto.categoriaAyuda}
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoria-gasto" className="text-nota font-medium text-texto-principal">
            {texto.categoria}
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
                {etiquetaDeCategoria(c)}
              </option>
            ))}
          </select>
          <p className="text-micro text-texto-tenue">
            {errores.categoria ? (
              <span className="text-gasto">{errores.categoria}</span>
            ) : (
              texto.categoriaAyuda
            )}
          </p>
        </div>
      )}

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
        {anotando ? texto.anotando : texto.accion}
      </Boton>
    </form>
  )
}
