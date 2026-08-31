import { z } from 'zod'
import { CategoriaMiniSchema, CuentaMiniSchema, TipoMovimientoSchema } from '@/utils/dashboard-schema'

/*
  Schemas de /transactions y /categories. Espejo de TransactionCreate,
  TransactionRead y CategoryRead del backend.

  Las piezas compartidas —tipo de movimiento, cuenta y categoría reducidas— se
  reutilizan del schema del dashboard en vez de repetirlas: es el mismo dato del
  mismo backend, y duplicarlo es garantizar que un día se desincronicen.
*/

/** Lo que se envía al anotar un gasto. Los cinco campos son obligatorios. */
export const AnotarGastoSchema = z.object({
  type: z.literal('expense'),
  /*
    El backend acepta número o string y valida con su propio patrón: hasta 12
    enteros y 2 decimales, con punto. La coma del teclado en español se traduce
    antes de llegar aquí.
  */
  amount: z.string().regex(/^\d{1,12}(\.\d{1,2})?$/, 'Escribe un monto válido, por ejemplo 12,75'),
  account_id: z.string().min(1, 'Elige de qué bolsillo salió'),
  category_id: z.string().min(1, 'Elige una categoría'),
  /*
    Fecha sin hora: "2026-08-31". El backend rechaza un instante completo con
    "Datetimes provided to dates should have zero time" — comprobado contra el
    servidor. Un gasto ocurre un día, no a una hora.
  */
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige una fecha'),
  note: z.string().max(255, 'Máximo 255 caracteres').nullable().optional(),
})

/** Movimiento tal como lo devuelve el backend al crearlo. */
export const MovimientoAPIResponseSchema = z.object({
  id: z.string(),
  type: TipoMovimientoSchema,
  amount: z.string(),
  currency: z.string(),
  occurred_at: z.string(),
  note: z.string().nullable(),
  account: CuentaMiniSchema,
  counter_account: CuentaMiniSchema.nullable(),
  category: CategoriaMiniSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

/** Categoría del catálogo. Vienen en árbol: cada padre trae sus hijos. */
export const CategoriaSchema: z.ZodType<{
  id: string
  name: string
  kind: string
  icon: string | null
  color: string | null
  is_system: boolean
  parent_id: string | null
  archived_at: string | null
  children: unknown[]
}> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    kind: z.string(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
    is_system: z.boolean(),
    parent_id: z.string().nullable(),
    archived_at: z.string().nullable(),
    children: z.array(CategoriaSchema).default([]),
  }),
)

/** Respuesta de GET /categories. */
export const ListaCategoriasAPIResponseSchema = z.object({
  items: z.array(CategoriaSchema),
})

/** Lo que acepta el PATCH de un movimiento. Todo opcional: es parcial. */
export const ActualizarMovimientoSchema = z.object({
  amount: z.string().regex(/^\d{1,12}(\.\d{1,2})?$/, 'Monto no válido').optional(),
  account_id: z.string().optional(),
  category_id: z.string().optional(),
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida').optional(),
  note: z.string().max(255).nullable().optional(),
})

/** Respuesta paginada de GET /transactions. La consulta la pagina el backend. */
export const ListaMovimientosAPIResponseSchema = z.object({
  items: z.array(MovimientoAPIResponseSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  total_pages: z.number(),
})

/*
  Pasar plata de un bolsillo a otro.

  Es una operación aparte y no un movimiento con tipo `transfer`: necesita dos
  cuentas y no lleva categoría, así que el backend le da su propio endpoint.
  Ahorrar es esto —una transferencia al bolsillo de ahorro—, no un gasto.
*/
export const TransferirSchema = z.object({
  amount: z.string().regex(/^\d{1,12}(\.\d{1,2})?$/, 'Escribe un monto válido'),
  from_account_id: z.string().min(1, 'Elige de dónde sale'),
  to_account_id: z.string().min(1, 'Elige a dónde va'),
  occurred_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige una fecha'),
  note: z.string().max(255).nullable().optional(),
})

/** Lo que se envía al crear una categoría propia. */
export const CrearCategoriaSchema = z.object({
  name: z.string().trim().min(1, 'Ponle un nombre').max(60, 'Máximo 60 caracteres'),
  kind: z.enum(['income', 'expense']),
  /** Cuelga de otra categoría. `null` la deja como categoría raíz. */
  parent_id: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})

/** Lo que acepta el PATCH de una categoría. El tipo no se cambia. */
export const ActualizarCategoriaSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})
