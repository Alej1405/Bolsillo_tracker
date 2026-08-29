/*
  El token de la sesión, en localStorage.

  Va aquí y no en cookie porque el backend responde con `allow_credentials=False`
  y `allow_origins=["*"]`: con eso el navegador no manda cookies entre orígenes,
  así que el token viaja en el header `Authorization`.

  Todo acceso va en try/catch: en modo privado o con las cookies de terceros
  bloqueadas, `localStorage` lanza al tocarlo. Una sesión que no se guarda es un
  inconveniente; una pantalla en blanco no.
*/
const CLAVE = 'bolsillo_token'

export function guardarToken(token: string): void {
  try {
    localStorage.setItem(CLAVE, token)
  } catch {
    // Sin almacenamiento la sesión dura lo que dure la pestaña.
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
    // Si no se pudo escribir, tampoco hay nada que borrar.
  }
}
