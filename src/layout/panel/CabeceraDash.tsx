import { useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { tituloDe } from '@/layout/panel/destinos'
import { Esperando } from '@/layout/panel/Esperando'
import { useAparicion } from '@/movimiento'
import { formatearMonto} from '@/utils/moneda'
import { Boton } from '@/ui/Boton'
import { SignOutIcon} from '@phosphor-icons/react'
import { nombreDelMes, useCerrarSesion } from '@/helpers'
import { useAppStore } from '@/stores/useAppStore'
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
    Un mes sin movimientos no es un mes en positivo.

    La píldora pintaba «+ $0,00» en verde: el signo y el color dicen "ganaste",
    y cero no es ganar nada. En una aplicación de finanzas eso es lo único que
    la interfaz no se puede permitir, porque es el dato que la persona viene a
    creerse. En cero se dice lo que pasa, en gris y sin signo.
  */
  const enCero = Number(neto?.replace(',', '.') ?? 0) === 0
  /*
    El formateo va por `utils/moneda`, que es el único sitio que sabe leer las
    dos formas en que llegan los montos: "12.40" del backend real y "1.248,50"
    del mock. Aquí había una función propia que solo añadía ",00" cuando no
    veía una coma, y con "12.40" producía "$12.40,00".
  */
  const limpio = formatearMonto(neto?.replace('-', '').trim())
  const cerrarSesion = useCerrarSesion()
  const cargandoRendimiento = useAppStore((e) =>e.cargandoRendimiento)
  /*
    Quien administra no tiene un mes que mirar: su cifra es cuánta gente está
    usando Bolsillo. Sale de las mismas estadísticas que pinta su panel, así
    que no cuesta una petición más.
  */
  const esAdmin = useAppStore((e) => e.usuario?.role) === 'super_admin'
  const activos = useAppStore((e) => e.estadisticas?.users.active)
  
  //console.log("aqui estoy",valorDe)
  return (
    
    <motion.header
      {...aparece(0.04)}
      className="vidrio-secundario sticky top-5 z-30 flex flex-wrap items-center gap-4 rounded-grande p-2 shadow-lg md:top-6"
    >
      <h1 className="ml-5 flex-1 font-cuerpo text-nota font-bold text-texto-principal">{titulo}</h1>
      
    {esAdmin ? (
      activos !== undefined && (
        <p className="flex items-center gap-4 rounded-full bg-ingreso-sutil px-4 py-1 shadow-xl">
          <span className="text-nota text-texto-secundario uppercase">Usuarios activos</span>
          <span className="font-cuerpo text-cuerpo-amplio font-bold tabular-nums text-ingreso">
            {activos}
          </span>
        </p>
      )
    ) : cargando || cargandoRendimiento ? (
      <Esperando alto={32} className="w-40 rounded-full" /> 
      ) : (
        (neto) && (
          <p
            className={`flex items-center gap-4 rounded-full px-4 py-1 shadow-xl ${
              enCero ? 'bg-fondo-sutil' : enContra ? 'bg-gasto-sutil' : 'bg-ingreso-sutil'
            }`}
          >
            {neto && (
              <>
                <span className="text-nota text-texto-secundario uppercase">
                  {nombreDelMes(mes) || 'Este mes'}
                </span>
                {enCero ? (
                  <span className="text-nota text-texto-secundario">Sin movimientos</span>
                ) : (
                  <span
                    className={`font-cuerpo text-cuerpo-amplio font-bold tabular-nums ${
                      enContra ? 'text-gasto' : 'text-ingreso'
                    }`}
                  >
                    {enContra ? '−' : '+'} ${limpio}
                  </span>
                )}
              </>
            )}
          </p>
        )
      )}
      <Boton
        variante="salir"
        onClick={cerrarSesion} 
        tamano="pequeno"
        className='min-h-11 p-3 shadow-xl'>
        <SignOutIcon size={18} aria-hidden />
        Salir
      </Boton>
    </motion.header>
  )
}
