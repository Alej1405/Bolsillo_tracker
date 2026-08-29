import { z } from 'zod'

/*
  Schemas del dashboard. Espejo de DashboardResponse del backend.

  Todos los montos llegan como `string` y ya formateados, y `percentage` ya
  calculado: el backend calcula, el frontend formatea. Nada de esto se suma
  ni se promedia aquí.
*/

/** Tipo de cuenta o bolsillo. */
export const TipoCuentaSchema = z.enum(['cash', 'bank', 'card', 'savings'])

/** Tipo de movimiento. */
export const TipoMovimientoSchema = z.enum(['income', 'expense', 'transfer'])

/** Cuenta como aparece dentro de un movimiento. */
export const CuentaMiniSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: TipoCuentaSchema,
  icon: z.string().nullable(),
})

/** Categoría como aparece dentro de un movimiento o un reporte. */
export const CategoriaMiniSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
})

/** Movimiento con todo lo necesario para pintar una fila. */
export const MovimientoSchema = z.object({
  id: z.string(),
  type: TipoMovimientoSchema,
  amount: z.string(),
  currency: z.string(),
  occurred_at: z.string(),
  note: z.string().nullable(),
  account: CuentaMiniSchema,
  counter_account: CuentaMiniSchema.nullable(),
  category: CategoriaMiniSchema.nullable(),
})

/** Cuenta con su saldo, para la tira de bolsillos. */
export const CuentaDashboardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: TipoCuentaSchema,
  balance: z.string(),
  icon: z.string().nullable(),
})

/** Una categoría de gasto con su monto y su porcentaje del total. */
export const CategoriaGastoSchema = z.object({
  category: CategoriaMiniSchema,
  amount: z.string(),
  percentage: z.number(),
})

/** Ingresos, egresos, neto y ahorrado del periodo. */
export const TotalesSchema = z.object({
  total_income: z.string(),
  total_expense: z.string(),
  net: z.string(),
  total_saved: z.string(),
})

/** Respuesta de GET /reports/dashboard: toda la pantalla en una petición. */
export const DashboardAPIResponseSchema = z.object({
  current_month: z.string(),
  total_balance: z.string(),
  summary: TotalesSchema,
  accounts: z.array(CuentaDashboardSchema),
  top_expense_categories: z.array(CategoriaGastoSchema),
  recent_transactions: z.array(MovimientoSchema),
})
