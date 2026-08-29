import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { curva, duracion } from '@/movimiento'

type Variante = 'principal' | 'destacado' | 'secundario' | 'sutil'
type Tamano = 'mediano' | 'grande'

type BotonProps = {
  children: ReactNode
  variante?: Variante
  tamano?: Tamano
  className?: string
  /** Si se pasa, el botón navega a esta ruta (se renderiza como enlace). */
  to?: string
} & ComponentProps<'button'>

/*
  El radio vive en cada variante, no en las clases base: `destacado` necesita
  una forma distinta de la píldora, y dos utilidades `rounded-*` en el mismo
  className compiten por orden en la hoja compilada, no por orden en el string.
*/
const variantes: Record<Variante, string> = {
  principal:
    'rounded-nav bg-accion-principal text-texto-sobre-marca hover:bg-accion-principal-encima shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--color-lavanda-900)_60%,transparent)]',
  /*
    Llamada a la acción principal de la landing. Existe como variante propia
    porque el botón de la barra de navegación usa `principal` y va a /login:
    si los dos se ven igual, el visitante nuevo no distingue cuál es el suyo.
    Relleno lavanda-900 —el color más saturado de la paleta, extraído de la
    misma fotografía— y sombra en tinta, porque una sombra lavanda sobre un
    fondo lavanda no se ve.
  */
  destacado:
    'rounded-grande bg-lavanda-900 text-texto-inverso hover:bg-lavanda-950 shadow-[0_14px_34px_-12px_color-mix(in_srgb,var(--color-tinta-900)_45%,transparent)]',
  secundario:
    'rounded-nav bg-fondo-superficie text-texto-principal border border-borde-normal hover:bg-fondo-sutil',
  sutil: 'rounded-nav bg-transparent text-texto-principal hover:bg-fondo-sutil',
}

const tamanos: Record<Tamano, string> = {
  mediano: 'h-11 px-5 text-cuerpo',
  grande: 'h-[52px] px-7 text-cuerpo-medio',
}

const MotionLink = motion.create(Link)

/**
 * Botón del UI Kit. Feedback táctil al presionar (scale 0.97) con curva
 * ease-out corta, desactivado bajo prefers-reduced-motion.
 * Con `to`, se renderiza como enlace de navegación (react-router).
 */
export function Boton({
  children,
  variante = 'principal',
  tamano = 'grande',
  className = '',
  to,
  ...props
}: BotonProps) {
  const menosMovimiento = useReducedMotion()
  // El anillo de foco va por fuera del botón (`outline-offset`), no encima: el
  // relleno de las dos variantes llenas es demasiado oscuro para que se lea
  // sobre él. `focus-visible` y no `focus`, para que no quede pegado tras un clic.
  const foco =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta-900'
  const clases = `inline-flex items-center justify-center gap-2 font-cuerpo font-semibold whitespace-nowrap transition-colors ${foco} ${variantes[variante]} ${tamanos[tamano]} ${className}`
  const tap = menosMovimiento ? undefined : { scale: 0.97 }
  const transicion = { duration: duracion.toque, ease: curva.salida }

  if (to) {
    return (
      <MotionLink to={to} whileTap={tap} transition={transicion} className={clases}>
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.button
      whileTap={tap}
      transition={transicion}
      className={clases}
      {...(props as ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  )
}
