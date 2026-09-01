/*
  Lo que usa más de una pantalla.

  Regla del proyecto: si una función, una constante o una clase se necesita en
  dos sitios, vive aquí y se importa. Copiarla en cada archivo es lo que vuelve
  las pantallas ilegibles y obliga a corregir el mismo fallo varias veces.

  Lo que NO va aquí:
    · lo que usa una sola pantalla — se queda en ella
    · las llamadas a la API y su estado — eso es `services/`, `stores/`, `types/`
      y `utils/`, cuya estructura no se toca
    · los componentes con JSX — esos van a `ui/`, que es su carpeta

  Está ordenado por temas: sesión, fechas, categorías, texto y clases.
*/

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores/useAppStore'
import type { Categoria } from '@/types'

// ── Sesión ───────────────────────────────────────────────────────────────

/**
 * Cerrar sesión: olvidar los datos, soltar el token y volver al acceso.
 *
 * Los tres pasos van juntos siempre y en este orden. Si se cerrara la sesión
 * sin limpiar el panel, los datos de quien salió seguirían en memoria y los
 * vería la siguiente persona que entrara desde el mismo navegador.
 *
 * `replace: true` sustituye la entrada en el historial en vez de añadir una:
 * el botón "atrás" no debe devolver a un panel al que ya no se tiene acceso.
 *
 * Es un hook y no una función suelta porque necesita navegar y leer el store,
 * y las dos cosas solo existen dentro de un componente.
 */
export function useCerrarSesion(): () => void {
  const navegar = useNavigate()
  const salir = useAppStore((e) => e.salir)
  const limpiarDashboard = useAppStore((e) => e.limpiarDashboard)

  return useCallback(() => {
    limpiarDashboard()
    salir()
    navegar('/login', { replace: true })
  }, [limpiarDashboard, salir, navegar])
}

// ── Fechas ───────────────────────────────────────────────────────────────

/** Los meses en español, en minúscula. El índice 0 es enero. */
export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const

/**
 * Primer y último día de un mes, como los pide la API: "2026-08-01".
 *
 * `mes` va de 1 a 12, no de 0 a 11: es el número del mes tal como lo escribe
 * una persona. El último día se saca pidiendo el día 0 del mes siguiente, que
 * en JavaScript es el último del anterior, y así funciona en febrero y en los
 * años bisiestos sin ninguna tabla.
 */
export function rangoDelMes(anio: number, mes: number): { desde: string; hasta: string } {
  const dd = (n: number) => String(n).padStart(2, '0')
  const ultimo = new Date(anio, mes, 0).getDate()
  return { desde: `${anio}-${dd(mes)}-01`, hasta: `${anio}-${dd(mes)}-${dd(ultimo)}` }
}

/** Nombre del mes de un "2026-08" que llega de la API. Cadena vacía si no hay. */
export function nombreDelMes(mes?: string): string {
  if (!mes) return ''
  const numero = Number(mes.split('-')[1])
  return MESES[numero - 1] ?? ''
}

/** Los últimos `cuantos` años, del actual hacia atrás, para un selector. */
export function ultimosAnios(cuantos = 5): number[] {
  const hoy = new Date().getFullYear()
  return Array.from({ length: cuantos }, (_, i) => hoy - i)
}

// ── Categorías ───────────────────────────────────────────────────────────

/** Una categoría lista para un `<option>`: la hija, y de quién es hija. */
export type CategoriaElegible = { id: string; nombre: string; padre?: string }

/**
 * Aplana el árbol de categorías para poder ponerlo en un selector.
 *
 * Se eligen las HOJAS, no los padres: "Alimentación" agrupa, "Mercado" es
 * donde de verdad cae un gasto. Una categoría sin hijas es hoja ella misma.
 *
 * El padre se devuelve aparte en vez de pegado al nombre para que cada
 * pantalla lo muestre como le convenga: unido con un punto en una lista larga,
 * o en dos líneas cuando hay sitio. Para el caso corriente está `etiquetaDeCategoria`.
 */
export function hojasDeCategorias(categorias: Categoria[]): CategoriaElegible[] {
  const salida: CategoriaElegible[] = []
  for (const c of categorias) {
    const hijos = c.children ?? []
    if (hijos.length === 0) salida.push({ id: c.id, nombre: c.name })
    else for (const h of hijos) salida.push({ id: h.id, nombre: h.name, padre: c.name })
  }
  return salida
}

/**
 * "Alimentación · Mercado", o solo el nombre si la categoría no tiene padre.
 *
 * Se llama `etiquetaDeCategoria` y no `etiquetaDe` porque `FormularioBolsillo`
 * ya exporta un `etiquetaDe` para los tipos de bolsillo. Dos funciones con el
 * mismo nombre y distinto significado se confunden al importar.
 */
export function etiquetaDeCategoria(categoria: CategoriaElegible): string {
  return categoria.padre ? `${categoria.padre} · ${categoria.nombre}` : categoria.nombre
}

// ── Texto ────────────────────────────────────────────────────────────────

/**
 * Iniciales de un nombre: "Pablo Revilla" → "PR".
 *
 * Es lo que se muestra donde iría la foto cuando no hay ninguna. Con un solo
 * nombre devuelve una letra, y sin nombre dos puntos, que ocupan el mismo
 * sitio y no dejan el círculo vacío mientras carga la sesión.
 */
export function iniciales(nombre?: string): string {
  if (!nombre?.trim()) return '··'
  const partes = nombre.trim().split(/\s+/)
  return (partes[0][0] + (partes[1]?.[0] ?? '')).toUpperCase()
}

// ── Clases compartidas ───────────────────────────────────────────────────

/*
  El aro de foco de todo control que se pueda pulsar o escribir. Va aparte
  porque se repetía en cinco pantallas, y el día que cambie el color del aro
  tiene que cambiar en todas a la vez.
*/
export const foco =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco'

/** El aspecto de un campo: los `select`, los `date` y el buscador. */
export const control = `h-11 rounded-grande border border-borde-fuerte bg-fondo-superficie px-4 text-nota text-texto-principal outline-none ${foco}`

/*
  Lo mismo para un `select`. `appearance-none` quita la flecha que dibuja el
  navegador: esa no se puede mover y queda pegada al borde, así que cada select
  pone la suya con un icono posicionado encima.

  `pr-9` es lo que reserva el sitio de esa flecha. La flecha va en `right-3` y
  mide 14px, así que ocupa hasta 26px desde el borde: con menos padding el texto
  del select le pasa por debajo. Se veía en el selector de año, donde "2026" y
  la flecha se pisaban.
*/
export const selector = `${control} appearance-none pr-9`
