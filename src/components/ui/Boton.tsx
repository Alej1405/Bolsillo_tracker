import type { ComponentProps, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { curva, duracion } from '@/movimiento'

type Variante = 'principal' | 'secundario' | 'sutil'
type Tamano = 'mediano' | 'grande'

type BotonProps = {
  children: ReactNode
  variante?: Variante
  tamano?: Tamano
  className?: string
  /** Si se pasa, el botón navega a esta ruta (se renderiza como enlace). */
  to?: string
} & ComponentProps<'button'>

const variantes: Record<Variante, string> = {
  principal:
    'bg-accion-principal text-texto-sobre-marca hover:bg-accion-principal-encima shadow-[0_10px_30px_-12px_color-mix(in_srgb,var(--color-lavanda-900)_60%,transparent)]',
  secundario:
    'bg-fondo-superficie text-texto-principal border border-borde-normal hover:bg-fondo-sutil',
  sutil: 'bg-transparent text-texto-principal hover:bg-fondo-sutil',
}

const tamanos: Record<Tamano, string> = {
  mediano: 'h-11 px-5 text-[15px]',
  grande: 'h-[52px] px-7 text-[16px]',
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
  const clases = `inline-flex items-center justify-center gap-2 rounded-[var(--radius-nav)] font-cuerpo font-semibold whitespace-nowrap transition-colors ${variantes[variante]} ${tamanos[tamano]} ${className}`
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
