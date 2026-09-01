import { useEffect, useState } from 'react'
import { iniciales } from '@/helpers'
import { urlDeMedio } from '@/utils/medios'
import type { ReactNode } from 'react'

/**
 * La foto de perfil, con su plan B.
 *
 * Si la imagen no carga —el archivo se perdió, la red falló, la ruta quedó
 * apuntando a nada— el navegador pinta su icono de imagen rota: un cuadro gris
 * con una hoja partida. Eso es peor que no tener foto, porque parece que la
 * aplicación está averiada.
 *
 * Aquí, si falla, aparecen las iniciales. La persona ve lo mismo que vería si
 * nunca hubiera subido una foto, que es exactamente lo correcto.
 *
 * Hizo falta por un caso real: las fotos se guardaban dentro del directorio del
 * proyecto, que se borra en cada despliegue, así que los `avatar_url` de la
 * base quedaban apuntando a archivos inexistentes. Eso ya está arreglado en el
 * servidor, pero un `<img>` puede fallar por muchas razones y ninguna debería
 * verse como un error de la aplicación.
 */
export function Avatar({
  url,
  nombre,
  alt = '',
  className = '',
  respaldo,
}: {
  /** El `avatar_url` tal como llega del backend. */
  url?: string | null
  /** Para calcular las iniciales cuando no hay foto. */
  nombre?: string
  /** Vacío cuando el nombre ya se lee al lado: repetirlo lo diría dos veces. */
  alt?: string
  /** Clases del círculo. Cada sitio decide su tamaño. */
  className?: string
  /** Qué mostrar en vez de las iniciales. `MiCuenta` usa un icono. */
  respaldo?: ReactNode
}) {
  /* `urlDeMedio` devuelve null cuando no hay foto; `src` quiere undefined. */
  const foto = urlDeMedio(url) ?? undefined
  const [falló, setFalló] = useState(false)

  /*
    Si cambia la foto —alguien acaba de subir una nueva— se vuelve a intentar.
    Sin esto, un fallo anterior dejaría las iniciales para siempre aunque la
    nueva imagen cargue perfectamente.
  */
  useEffect(() => setFalló(false), [foto])

  const hayImagen = Boolean(foto) && !falló

  return (
    <span className={className}>
      {hayImagen ? (
        <img
          src={foto}
          alt={alt}
          className="size-full object-cover"
          onError={() => setFalló(true)}
        />
      ) : (
        (respaldo ?? <span aria-hidden>{iniciales(nombre)}</span>)
      )}
    </span>
  )
}
