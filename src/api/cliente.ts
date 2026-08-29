/*
  Cliente HTTP de Bolsillo. Todo lo que sale hacia la API pasa por aquí.

  Su único trabajo es hablar el idioma de errores que ya habla el backend. Ese
  contrato es fijo y viene de app/core/exception_handlers.py:

    { "error": { "code": "...", "message": "...", "details": [...] } }

  Traducirlo una sola vez, aquí, evita que cada pantalla tenga que adivinar de
  qué forma viene un fallo.
*/

/*
  Vite sustituye esto en tiempo de compilación, no lo lee al ejecutarse: si el
  build corrió sin la variable, aquí queda `undefined` para siempre y no hay
  forma de arreglarlo desde el navegador.

  La comprobación va dentro de `pedir` y no en el cuerpo del módulo. Lanzarla
  al importar parece más estricto, pero este archivo entra en el bundle
  principal —no hay carga diferida por ruta—, así que un despliegue sin la
  variable dejaba la landing entera en blanco: alguien que solo venía a leer
  la portada se quedaba sin nada por un fallo que solo afecta a las llamadas a
  la API. Así falla lo que depende de la API, y solo eso.
*/
const BASE = import.meta.env.VITE_API_URL

/** Un fallo por campo, tal como lo manda `validation_handler`. */
export type FalloDeCampo = { field: string; message: string }

/**
 * Error de la API con el código de negocio que devolvió el backend.
 *
 * `codigo` es el que importa para decidir qué hacer: CONFLICT en un registro
 * es un correo repetido, no un fallo genérico. Los códigos están en
 * app/core/errors.py.
 */
export class ErrorApi extends Error {
  readonly codigo: string
  readonly estado: number
  readonly campos: FalloDeCampo[]

  constructor(codigo: string, mensaje: string, estado: number, campos: FalloDeCampo[] = []) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.codigo = codigo
    this.estado = estado
    this.campos = campos
  }
}

/** Error de red: no hubo respuesta. No es lo mismo que un 500. */
export class ErrorDeRed extends Error {
  constructor() {
    super('No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.')
    this.name = 'ErrorDeRed'
  }
}

type Opciones = {
  metodo?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  cuerpo?: unknown
  token?: string
}

/**
 * Hace una petición a la API y devuelve el JSON ya tipado.
 *
 * Lanza `ErrorApi` si el backend respondió con un fallo, y `ErrorDeRed` si no
 * respondió. Quien llama decide qué hacer con cada uno: solo el primero tiene
 * un código de negocio que interpretar.
 */
export async function pedir<T>(ruta: string, opciones: Opciones = {}): Promise<T> {
  const { metodo = 'GET', cuerpo, token } = opciones

  if (!BASE) {
    // Se compiló sin VITE_API_URL. No es culpa del usuario y no se arregla
    // reintentando, así que se dice sin pedirle que lo intente de nuevo.
    throw new ErrorApi(
      'SIN_CONFIGURAR',
      'La aplicación no está bien configurada. Avísanos y lo revisamos.',
      0,
    )
  }

  let respuesta: Response
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: {
        ...(cuerpo ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    // fetch solo rechaza por fallo de red: DNS, CORS, servidor caído.
    throw new ErrorDeRed()
  }

  // 204 y compañía no traen cuerpo; parsearlos revienta.
  const texto = await respuesta.text()
  const datos = texto ? JSON.parse(texto) : null

  if (!respuesta.ok) {
    const error = datos?.error
    throw new ErrorApi(
      error?.code ?? 'INTERNAL_ERROR',
      error?.message ?? 'Algo salió mal. Inténtalo de nuevo.',
      respuesta.status,
      error?.details ?? [],
    )
  }

  return datos as T
}
