/*
  La sesión del usuario: el token que devuelve el backend al registrarse o
  iniciar sesión.

  Va en localStorage y no en cookie porque el backend responde con
  `allow_credentials=False` y `allow_origins=["*"]`: con esa configuración el
  navegador no manda cookies entre orígenes, así que el token tiene que viajar
  en el header `Authorization`. Si algún día el CORS pasa a un origen explícito
  con credenciales, esto se reemplaza por una cookie httpOnly y el resto del
  frontend no se entera.

  Todo acceso va envuelto en try/catch: en modo privado de Safari, o con las
  cookies de terceros bloqueadas, `localStorage` no falla al leer — falla al
  tocarlo. Una sesión que no se puede guardar es un inconveniente; una pantalla
  en blanco no.
*/

const CLAVE = 'bolsillo_token'

export function guardarToken(token: string): void {
  try {
    localStorage.setItem(CLAVE, token)
  } catch {
    // Sin almacenamiento la sesión dura lo que dure la pestaña. Se sigue.
  }
}

export function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE)
  } catch {
    return null
  }
}

export function borrarToken(): void {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // Nada que hacer: si no se pudo escribir, tampoco hay nada que borrar.
  }
}
