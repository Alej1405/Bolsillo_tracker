import { useState } from 'react'
import { TarjetaMedida } from '@/piezas/TarjetaMedida'
import { SEMAFORO, valorDe } from '@/piezas/medida'
import { nombreDelMes } from '@/helpers'
import { Boton } from '@/ui/Boton'
import { Modal } from '@/ui/Modal'
import { useTipoPantalla } from '@/pantalla'
import { useAppStore } from '@/stores/useAppStore'
import type { Medida } from '@/types'

/*
  Las dos que contestan la pregunta con la que la gente entra: cuánto se quedó
  y cuánto le dura. El resto son matices, y en un teléfono un matiz de más tapa
  la respuesta.
*/
const EN_CELULAR = ['cuanto_guarde', 'cuanto_aguanta']

/** Dónde se guarda el último resumen visto, para no repetirlo cada vez. */
const CLAVE = 'bolsillo_resumen_visto'

/*
  Las medidas que hablan de LO QUE PASÓ EN EL PERIODO. Las otras dos —cuánto
  tienes y cuánto te dura— hablan de lo acumulado y siguen dando cifras aunque
  el mes esté vacío: un 1 de septiembre sin movimientos todavía dice "te dura 6
  meses", y un resumen montado sobre eso abre para anunciar "$0,00, todavía no
  hay movimientos en estas fechas".

  Ese es exactamente el aviso que no hay que dar: interrumpe para no contar
  nada.

  "Comparado con antes" tampoco entra, y por lo mismo: en un mes vacío sigue
  diciendo "guardaste $1.902,85 menos que en el periodo anterior", que es
  cierto y aun así no cuenta nada de este mes.
*/
const DEL_PERIODO = ['cuanto_guarde', 'de_cada_cien', 'gasto_diario']

/*
  Hay resumen cuando el periodo tuvo movimiento de verdad. Si no, no se abre:
  un diálogo que dice "no tienes nada" hace perder un toque a quien acaba de
  empezar, y le enseña a cerrar sin leer el que sí importará el mes que viene.
*/
function hayAlgoQueContar(medidas: Medida[]): boolean {
  const cifra = (v: string | number) => Math.abs(Number(String(v).replace(',', '.')) || 0)
  return medidas.some((m) => DEL_PERIODO.includes(m.key) && cifra(m.value) > 0)
}

/**
 * El resumen del mes, en cuanto hay algo que contar.
 *
 * Bolsillo calcula seis medidas y las explica en una frase cada una, pero
 * viven en la pantalla de rendimiento, y a esa pantalla solo entra quien ya
 * sabe que existe. Quien más necesita saber si le alcanza para el mes que
 * viene es justamente quien nunca abre un reporte.
 *
 * Por eso el resumen sale a buscar a la persona una vez por periodo, en vez de
 * esperar a que lo busque. Vuelve a aparecer cuando cambia el mes —hay cifras
 * nuevas— y no antes: repetirlo en cada visita lo convertiría en un estorbo
 * que se cierra sin leer.
 *
 * En un teléfono son dos cifras; en una pantalla grande, las seis. No es la
 * misma pantalla encogida: es que en el teléfono se lee de pie y en treinta
 * segundos, y la tercera cifra ya no se lee.
 *
 * Ni una palabra la escribe esta pieza. Las frases llegan redactadas del
 * backend, que es quien hace la cuenta: si el número y su explicación se
 * escriben en sitios distintos, tarde o temprano dicen cosas distintas.
 */
export function ResumenRendimiento() {
  const usuario = useAppStore((e) => e.usuario)
  const rendimiento = useAppStore((e) => e.rendimiento)
  const cargando = useAppStore((e) => e.cargandoRendimiento)
  const esCelular = useTipoPantalla() === 'celular'

  /*
    El último resumen visto se lee al montar y ya: como inicializador de
    `useState` corre una sola vez y no provoca un render de más, que es lo que
    pasaba leyéndolo en un efecto.

    Sin almacenamiento —modo privado, permisos— vale `null` y el resumen sale
    igual: repetirlo es peor que no mostrarlo, pero mucho mejor que fallar.
  */
  const [visto, setVisto] = useState<string | null>(() => {
    try {
      return localStorage.getItem(CLAVE)
    } catch {
      return null
    }
  })

  const esCliente = usuario ? usuario.role !== 'super_admin' : false
  const periodo = rendimiento ? `${rendimiento.period.from}_${rendimiento.period.to}` : null
  const medidas = rendimiento?.metrics ?? []

  /*
    Solo el mes en curso. La pantalla de Rendimiento deja elegir el mes y
    escribe en el mismo sitio del store: sin esta condición, mirar mayo desde
    ahí abriría el resumen de mayo encima de la pantalla que se está mirando —
    un diálogo que aparece porque usaste un filtro es un diálogo roto.
  */
  const mesEnCurso = new Date().toISOString().slice(0, 7)
  const esDeEsteMes = rendimiento?.period.from.slice(0, 7) === mesEnCurso

  const abierto =
    esCliente &&
    !cargando &&
    !!rendimiento &&
    periodo !== null &&
    visto !== periodo &&
    esDeEsteMes &&
    hayAlgoQueContar(medidas)

  const cerrar = () => {
    if (periodo) {
      try {
        localStorage.setItem(CLAVE, periodo)
      } catch {
        /* Si no se puede guardar, al menos se cierra ahora. */
      }
      setVisto(periodo)
    }
  }

  if (!rendimiento) return null

  const mes = nombreDelMes(rendimiento.period.from.slice(0, 7))
  const enCelular = EN_CELULAR.map((k) => medidas.find((m) => m.key === k)).filter(
    (m): m is Medida => Boolean(m),
  )

  return (
    <Modal
      abierto={abierto}
      onCerrar={cerrar}
      ancho={esCelular ? 'normal' : 'amplio'}
      titulo={`Cómo te fue en ${mes || 'este periodo'}`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <p className="text-micro tracking-[0.08em] text-texto-tenue uppercase">Tu resumen</p>
          <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">
            Cómo te fue en {mes || 'este periodo'}
          </h2>
          <p className="text-cuerpo leading-relaxed text-texto-secundario">
            Esto es lo que pasó con tu plata. Nada que hacer, solo mirarlo.
          </p>
        </div>

        {esCelular ? (
          /*
            En el teléfono cada medida es una fila que se lee de un vistazo: el
            número grande arriba y debajo la frase. La tarjeta de escritorio
            aquí obligaría a desplazar para ver dos cifras.
          */
          <ul className="flex flex-col gap-3">
            {enCelular.map((m) => {
              const { texto, fondo, Icono } = SEMAFORO[m.level]
              return (
                <li key={m.key} className="flex flex-col gap-2 rounded-extra bg-fondo-sutil p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-micro tracking-[0.08em] text-texto-tenue uppercase">
                      {m.label}
                    </p>
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full ${fondo} ${texto}`}
                    >
                      <Icono size={16} weight="fill" aria-hidden />
                    </span>
                  </div>
                  <p className={`font-cuerpo text-titulo-medio font-bold tabular-nums ${texto}`}>
                    {valorDe(m)}
                  </p>
                  <p className="text-nota leading-relaxed text-texto-secundario">{m.reading}</p>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {medidas.map((m) => (
              <TarjetaMedida key={m.key} medida={m} />
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Boton
            onClick={cerrar}
            variante="cta"
            className="min-h-12 w-full bg-marca-700 hover:bg-tinta-400"
          >
            {/* El tamaño lo pone el botón, no la variante. */}
            <span className="text-cuerpo">Entendido</span>
          </Boton>
          <p className="text-center text-micro text-texto-tenue">
            Puedes volver a verlo cuando quieras en Rendimiento.
          </p>
        </div>
      </div>
    </Modal>
  )
}
