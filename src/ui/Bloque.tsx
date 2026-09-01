/**
 * Una sección con su título y una línea que explica de qué va.
 *
 * Es el patrón de las pantallas de ajustes: cada cosa que se puede cambiar va
 * en su bloque, con el título diciendo qué es y la descripción diciendo qué
 * implica cambiarlo. Vive en `ui/` porque no sabe nada del dominio: le da igual
 * si dentro hay un formulario de contraseña o una lista.
 *
 * El título es `h3` porque siempre cuelga del `h2` de la pantalla. Saltarse un
 * nivel rompe la navegación por encabezados de un lector de pantalla.
 */
export function Bloque({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-extra bg-fondo-superficie p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-titulo text-cuerpo-amplio font-semibold text-texto-principal">
          {titulo}
        </h3>
        <p className="text-nota text-texto-tenue">{descripcion}</p>
      </div>
      {children}
    </section>
  )
}
