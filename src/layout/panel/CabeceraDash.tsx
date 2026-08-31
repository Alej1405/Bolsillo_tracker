import { useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { tituloDe } from '@/layout/panel/destinos'
import { Esperando } from '@/layout/panel/Esperando'
import { useAparicion } from '@/movimiento'
import { formatearMonto } from '@/utils/moneda'

/**
 * Barra superior del panel: en qué pantalla estás y cómo va el mes.
 *
 * El título sale de la ruta, no de una prop: es el mismo elemento en las cinco
 * pantallas del panel y tiene que decir dónde estás.
 *
 * La cifra es el **neto** —lo mismo que el gráfico llama "Te sobró"—, no lo
 * que entró, y lleva el signo además del color: verde y rojo no se distinguen
 * con daltonismo rojo-verde, y es la regla de toda la aplicación.
 *
 * Las medidas son deliberadamente pequeñas. Es una barra de orientación, no un
 * encabezado de portada: lo que la persona vino a leer está debajo.
 */
export function CabeceraDash({
  neto,
  mes,
  cargando,
}: {
  /** Ya formateado por el backend, sin signo. */
  neto?: string
  /** "2026-08" → se muestra como "agosto". */
  mes?: string
  cargando: boolean
}) {
  const { pathname } = useLocation()
  const titulo = tituloDe(pathname)
  const aparece = useAparicion()

  const enContra = neto?.trim().startsWith('-')
  /*
    El formateo va por `utils/moneda`, que es el único sitio que sabe leer las
    dos formas en que llegan los montos: "12.40" del backend real y "1.248,50"
    del mock. Aquí había una función propia que solo añadía ",00" cuando no
    veía una coma, y con "12.40" producía "$12.40,00".
  */
  const limpio = formatearMonto(neto?.replace('-', '').trim())

  return (
    <motion.header
      {...aparece(0.04)}
      className="vidrio flex flex-wrap items-center gap-4 rounded-grande p-2"
    >
      <h1 className="ml-5 flex-1 font-cuerpo text-nota font-bold text-texto-principal">{titulo}</h1>

      {cargando ? (
        <Esperando alto={32} className="w-40 rounded-full" />
      ) : (
        neto && (
          <p
            className={`flex items-center gap-4 rounded-full px-4 py-1 ${
              enContra ? 'bg-gasto-sutil' : 'bg-ingreso-sutil'
            }`}
          >
            <span className="text-nota text-texto-secundario">
              {nombreDelMes(mes) ?? 'Este mes'}
            </span>
            <span
              className={`font-cuerpo text-cuerpo-amplio font-bold tabular-nums ${
                enContra ? 'text-gasto' : 'text-ingreso'
              }`}
            >
              {enContra ? '−' : '+'} ${limpio}
            </span>
          </p>
        )
      )}
    </motion.header>
  )
}

/** "2026-08" → "agosto". Sin el año: la cabecera habla del mes en curso. */
function nombreDelMes(mes?: string): string | null {
  if (!mes) return null
  const [anio, numero] = mes.split('-').map(Number)
  if (!anio || !numero) return null
  return new Date(anio, numero - 1, 1).toLocaleDateString('es-EC', { month: 'long' })
}
