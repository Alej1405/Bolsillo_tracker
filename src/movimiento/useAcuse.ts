import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReducedMotion } from 'motion/react'
import { duracion } from '@/movimiento/curvas'

/**
 * Navegación con acuse: deja al botón cambiando un instante antes de cambiar
 * de pantalla.
 *
 * La espera no es tiempo de carga —esto es una SPA y la ruta ya está en
 * memoria— sino la respuesta que el clic no tenía: sin ella la pantalla cambia
 * de golpe y el usuario no sabe si fue él quien la cambió.
 *
 * Está en un hook y no dentro del botón porque hay dos formas de disparar lo
 * mismo: pulsar el botón y darle a Enter en el campo de correo que lo
 * acompaña. Con el estado aquí, las dos recorren el mismo camino.
 *
 * Bajo prefers-reduced-motion navega en el acto: quien pidió menos movimiento
 * no debería esperar por una animación que no verá.
 *
 * @param a       ruta de destino
 * @param estado  lo que viaja con la navegación (react-router `state`), para
 *                que la pantalla de destino lo reciba sin pasar por la URL
 */
export function useAcuse(a: string, estado?: unknown) {
  const navegar = useNavigate()
  const menosMovimiento = useReducedMotion()
  const [yendo, setYendo] = useState(false)
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Si el componente se desmonta a media espera, el navigate ya no tiene a
  // quién avisar. Sin esto React advierte y la navegación queda huérfana.
  useEffect(() => {
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current)
    }
  }, [])

  const ir = () => {
    if (menosMovimiento) {
      navegar(a, { state: estado })
      return
    }
    if (yendo) return // doble clic: el primero ya está en camino
    setYendo(true)
    temporizador.current = setTimeout(() => navegar(a, { state: estado }), duracion.acuse * 1000)
  }

  return { yendo, ir }
}
