import { z } from 'zod'

/*
  Schemas de autenticación. Espejo de UserCreate, UserLogin y RegisterResponse
  del backend (/openapi.json): si el contrato cambia allá, se cambia aquí.
*/

/** Reglas de la contraseña, copiadas de `_validar_password` del backend. */
export const CLAVE = { min: 8, max: 72 } as const

/** Cuerpo de POST /auth/register. */
export const RegistroSchema = z.object({
  full_name: z.string().trim().min(2, 'Escribe tu nombre completo.').max(120, 'Máximo 120 caracteres.'),
  email: z.email('Ese correo no parece completo.'),
  password: z
    .string()
    .min(CLAVE.min, `La contraseña necesita al menos ${CLAVE.min} caracteres.`)
    .max(CLAVE.max, `Máximo ${CLAVE.max} caracteres.`)
    .regex(/[a-zA-Z]/, 'Le falta al menos una letra.')
    .regex(/\d/, 'Le falta al menos un número.'),
})

/** Cuerpo de POST /auth/login. Sin reglas de formato: se compara contra el hash. */
export const LoginSchema = z.object({
  email: z.email('Ese correo no parece completo.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

/** Usuario que devuelve la API (`UserRead`). */
export const UsuarioAPIResponseSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  email: z.string(),
  role: z.string(),
  created_at: z.string(),
})

/** Respuesta de registro y de login (`RegisterResponse`). */
export const AccesoAPIResponseSchema = z.object({
  user: UsuarioAPIResponseSchema,
  access_token: z.string(),
  token_type: z.string().default('bearer'),
  expires_in: z.number().default(86400),
})

/** Forma del error del backend (app/core/exception_handlers.py). */
export const ErrorAPIResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z
      .array(z.object({ field: z.string(), message: z.string() }))
      .default([]),
  }),
})

/** Lo que acepta el PATCH del perfil. El correo no se cambia. */
export const ActualizarPerfilSchema = z.object({
  full_name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
})

/*
  Cambio de contraseña. Exige la actual además de la nueva: sin eso, cualquiera
  que encuentre la sesión abierta se queda con la cuenta.

  El máximo de 72 no es capricho: bcrypt lanza a los 73 bytes.
*/
export const CambiarClaveSchema = z.object({
  current_password: z.string().min(1, 'Escribe tu contraseña actual'),
  new_password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(72, 'Máximo 72 caracteres')
    .regex(/[a-zA-Z]/, 'Necesita al menos una letra')
    .regex(/\d/, 'Necesita al menos un número'),
})

/** Página de usuarios. Solo la ve `super_admin`. */
export const ListaUsuariosAPIResponseSchema = z.object({
  items: z.array(UsuarioAPIResponseSchema.extend({ is_active: z.boolean() })),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  total_pages: z.number(),
})
