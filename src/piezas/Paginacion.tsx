import { Boton } from '@/ui/Boton'
import { foco } from '@/helpers'

/*
  El control de páginas de una lista.

  Existía dos veces con dos formas distintas: numerada en el bloque del panel y
  con Anterior/Siguiente en la pantalla de Historial. Son la misma función, así
  que viven aquí y la diferencia queda en `variante`.

  Cuál usar no es capricho: los números solo sirven cuando son pocos y se sabe
  cuántos hay —el panel pagina de cinco en cinco sobre lo que ya trajo el
  reporte—. En el historial completo las páginas las decide el servidor y pueden
  ser decenas, y una fila de treinta números no se puede pulsar ni leer.
*/

/**
 * @param pagina   la que se está viendo, empezando en 1
 * @param paginas  cuántas hay en total
 * @param ir       a dónde ir. Recibe el número de página
 * @param variante `numeros` para pocas páginas, `pasos` cuando pueden ser muchas
 */
export function Paginacion({
  pagina,
  paginas,
  ir,
  variante = 'numeros',
}: {
  pagina: number
  paginas: number
  ir: (n: number) => void
  variante?: 'numeros' | 'pasos'
}) {
  /* Con una sola página no hay nada que elegir: el control sobra. */
  if (paginas <= 1) return null

  if (variante === 'pasos') {
    return (
      <nav aria-label="Páginas" className="flex items-center gap-2">
        <Boton
          variante="secundario"
          tamano="mediano"
          onClick={() => ir(Math.max(pagina - 1, 1))}
          disabled={pagina === 1}
        >
          Anterior
        </Boton>
        <Boton
          variante="secundario"
          tamano="mediano"
          onClick={() => ir(Math.min(pagina + 1, paginas))}
          disabled={pagina === paginas}
        >
          Siguiente
        </Boton>
      </nav>
    )
  }

  const boton = `grid size-11 place-items-center rounded-medio text-nota font-medium transition-colors active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none ${foco}`
  const apagado =
    'border border-borde-fuerte bg-fondo-superficie text-texto-secundario hover:bg-fondo-sutil'

  return (
    <nav aria-label="Páginas" className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => ir(pagina - 1)}
        disabled={pagina === 1}
        aria-label="Página anterior"
        className={`${boton} ${apagado}`}
      >
        ‹
      </button>

      {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => ir(n)}
          aria-label={`Página ${n}`}
          /* `aria-current` es lo que le dice a un lector de pantalla en cuál
             está; el color solo lo dice a quien lo ve. */
          aria-current={n === pagina ? 'page' : undefined}
          className={`${boton} ${
            n === pagina ? 'bg-accion-principal text-texto-sobre-marca' : apagado
          }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        onClick={() => ir(pagina + 1)}
        disabled={pagina === paginas}
        aria-label="Página siguiente"
        className={`${boton} ${apagado}`}
      >
        ›
      </button>
    </nav>
  )
}
