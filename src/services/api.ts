import axios from 'axios'
import { ErrorAPIResponseSchema } from '@/utils/auth-schema'
import { leerToken } from '@/utils/sesion'

/*
  Instancia única de axios. Todos los servicios la usan en vez de escribir la
  URL en cada llamada: cambiar de servidor es cambiar el .env, no 30 archivos.
*/
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/** Adjunta el token a cada petición, si hay sesión. */
api.interceptors.request.use((config) => {
  const token = leerToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Error de la API con el código de negocio que devolvió el backend. */
export class ErrorApi extends Error {
  readonly codigo: string
  readonly estado: number
  readonly campos: { field: string; message: string }[]

  constructor(
    codigo: string,
    mensaje: string,
    estado: number,
    campos: { field: string; message: string }[] = [],
  ) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.codigo = codigo
    this.estado = estado
    this.campos = campos
  }
}

/** Error de red: no hubo respuesta. Distinto de un 500. */
export class ErrorDeRed extends Error {
  constructor() {
    super('No pudimos conectarnos. Revisa tu internet e inténtalo de nuevo.')
    this.name = 'ErrorDeRed'
  }
}

/*
  Traduce cualquier fallo de axios a `ErrorApi` o `ErrorDeRed`, para que las
  pantallas no tengan que conocer la forma del error del backend.
*/
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (!axios.isAxiosError(error) || !error.response) throw new ErrorDeRed()

    const parseado = ErrorAPIResponseSchema.safeParse(error.response.data)
    if (parseado.success) {
      const { code, message, details } = parseado.data.error
      throw new ErrorApi(code, message, error.response.status, details)
    }

    throw new ErrorApi(
      'INTERNAL_ERROR',
      'Algo salió mal. Inténtalo de nuevo.',
      error.response.status,
    )
  },
)
