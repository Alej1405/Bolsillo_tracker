/*
  Capa de movimiento. Todo lo que anima o reacciona al scroll entra por aquí:

    curvas.ts        curvas, duraciones y umbrales de scroll (los valores)
    Revelar.tsx      revela un bloque al entrar en vista (el disparador de scroll)
    useAparicion.ts  aparición al montar, para lo que ya está en pantalla
    CifraAnimada.tsx cifra que cuenta al entrar en vista
    BarraAnimada.tsx barras que crecen al entrar en vista

  Los componentes importan de '@/movimiento', no de los archivos sueltos.
*/
export { curva, duracion, vista, escalonado } from '@/movimiento/curvas'
export { Revelar } from '@/movimiento/Revelar'
export { useAparicion } from '@/movimiento/useAparicion'
export { CifraAnimada } from '@/movimiento/CifraAnimada'
export { BarraVertical, BarraHorizontal } from '@/movimiento/BarraAnimada'
