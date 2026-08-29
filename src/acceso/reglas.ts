/*
  Reglas del formulario de acceso, compartidas por escritorio y celular.

  Están fuera de las pantallas porque las dos las necesitan iguales: si una
  validara distinto que la otra, el mismo usuario vería un error en el teléfono
  que no ve en el portátil.
*/

/*
  Validación espejo de `UserCreate`, el esquema que publica el backend en
  /openapi.json. Los límites están copiados de ahí: si allá cambian, aquí
  también, o el formulario dejará pasar lo que el servidor rechaza.

  No es la autoridad — el backend revalida todo y su 422 manda. Esto solo
  ahorra el viaje y le dice al usuario qué pasa antes de esperar la respuesta.
*/
export const LIMITES = {
  nombre: { min: 2, max: 120 },
  clave: { min: 8, max: 72 },
} as const

/*
  Los tres requisitos de la contraseña, cada uno con la comprobación que le
  toca. Salen del validador `_validar_password` del backend (schemas/user.py)
  más el `min_length` de UserCreate — son los mismos, escritos aparte para
  poder mostrarlos uno por uno mientras el usuario escribe.

  El máximo de 72 no está en la lista a propósito: nadie escribe una clave de
  73 caracteres por accidente, y un requisito que siempre se cumple es ruido.
  Ese sí se avisa como error, y solo si llega a pasar.
*/
export const REQUISITOS = [
  {
    id: 'largo',
    texto: `Al menos ${LIMITES.clave.min} caracteres`,
    cumple: (clave: string) => clave.length >= LIMITES.clave.min,
  },
  { id: 'letra', texto: 'Al menos una letra', cumple: (clave: string) => /[a-zA-Z]/.test(clave) },
  { id: 'numero', texto: 'Al menos un número', cumple: (clave: string) => /\d/.test(clave) },
] as const

export const claveCompleta = (clave: string) => REQUISITOS.every((r) => r.cumple(clave))

export type CamposRegistro = { full_name: string; email: string; password: string }
export type ErroresRegistro = Partial<Record<keyof CamposRegistro, string>>

export function validarRegistro(datos: CamposRegistro): ErroresRegistro {
  const errores: ErroresRegistro = {}

  const nombre = datos.full_name.trim()
  if (nombre.length < LIMITES.nombre.min) errores.full_name = 'Escribe tu nombre completo.'
  else if (nombre.length > LIMITES.nombre.max)
    errores.full_name = `Máximo ${LIMITES.nombre.max} caracteres.`

  // Comprobación mínima: algo, arroba, algo, punto, algo. El backend usa
  // EmailStr, que es más estricto; no se replica aquí para no rechazar
  // correos válidos que el servidor sí aceptaría.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email))
    errores.email = 'Ese correo no parece completo.'

  /*
    De la contraseña solo se avisa el máximo. Los tres requisitos se muestran
    en su propia lista debajo del campo, que se marca sola mientras se escribe:
    repetirlos aquí como error rojo diría dos veces lo mismo.
  */
  if (datos.password.length > LIMITES.clave.max)
    errores.password = `Máximo ${LIMITES.clave.max} caracteres.`

  return errores
}

export const VACIO: CamposRegistro = { full_name: '', email: '', password: '' }

/**
 * El correo que el visitante escribió en la landing, si vino de ahí.
 *
 * Llega por el `state` de la navegación, no por la URL. Se comprueba el tipo
 * en vez de confiar: el `state` lo puede fabricar cualquiera desde la consola,
 * y un objeto ahí dentro reventaría el input al asignarlo como `value`.
 */
export function correoDeLaLanding(estado: unknown): string {
  if (estado && typeof estado === 'object' && 'correo' in estado) {
    const { correo } = estado as { correo: unknown }
    if (typeof correo === 'string') return correo
  }
  return ''
}

/*
  Nombres de campo del backend traducidos a los del formulario. Hoy coinciden,
  pero el mapa existe para que un `details[].field` desconocido no se pierda en
  silencio: lo que no esté aquí se muestra como aviso general.
*/
export const CAMPOS: Record<string, keyof CamposRegistro> = {
  full_name: 'full_name',
  email: 'email',
  password: 'password',
}
