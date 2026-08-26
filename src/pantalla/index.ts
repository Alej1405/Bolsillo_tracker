/*
  Capa de pantalla. Aquí entra todo lo que decide QUÉ se renderiza según el
  dispositivo por el que se conecta el usuario — no cómo se ve, que eso es
  Tailwind y sus breakpoints.

    useTipoPantalla.ts   celular / tableta / escritorio, en vivo

  Los componentes importan de '@/pantalla', no de los archivos sueltos.
*/
export { useTipoPantalla } from '@/pantalla/useTipoPantalla'
export type { TipoPantalla } from '@/pantalla/useTipoPantalla'
