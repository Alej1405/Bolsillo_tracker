import { z } from 'zod'
import { TipoCuentaSchema } from '@/utils/dashboard-schema'

/*
  Schemas de /accounts. Espejo de AccountCreate y AccountRead del backend.

  El tipo de cuenta se reutiliza del schema del dashboard en vez de repetir el
  enum: es el mismo dato del mismo backend, y duplicarlo es garantizar que un
  día se desincronicen.
*/

/** Lo que se envía al crear un bolsillo. `name` y `type` son obligatorios. */
export const CrearCuentaSchema = z.object({
  name: z.string().trim().min(1, 'Ponle un nombre').max(60, 'Máximo 60 caracteres'),
  type: TipoCuentaSchema,
  /*
    El backend acepta número o string y valida con su propio patrón: hasta 12
    enteros y 2 decimales. Aquí se manda como string con punto decimal, que es
    lo que ese patrón espera — la coma del teclado en español se traduce antes.
  */
  initial_balance: z
    .string()
    .regex(/^-?\d{1,12}(\.\d{1,2})?$/, 'Escribe un monto válido, por ejemplo 120,50')
    .optional(),
})

/** Cuenta tal como la devuelve el backend al crearla. */
export const CuentaAPIResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: TipoCuentaSchema,
  currency: z.string(),
  initial_balance: z.string(),
  balance: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  archived_at: z.string().nullable(),
  created_at: z.string(),
})

/** Lo que acepta el PATCH. El backend solo deja cambiar el nombre y el aspecto. */
export const ActualizarCuentaSchema = z.object({
  name: z.string().trim().min(1, 'Ponle un nombre').max(60, 'Máximo 60 caracteres').optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})

/**
 * Respuesta de GET /accounts.
 *
 * `total_balance` llega sumado por el backend: el frontend no suma saldos.
 */
export const ListaCuentasAPIResponseSchema = z.object({
  items: z.array(CuentaAPIResponseSchema),
  total_balance: z.string(),
})
