import { z } from 'zod'

/*
  Schemas de /admin/stats. Espejo de AdminStatsResponse del backend.

  Todo llega calculado: aquí no se suma ni se resta nada, ni siquiera los
  inactivos —que son el complemento de los activos— porque esa cuenta la hace
  el backend y duplicarla aquí es arriesgarse a que discrepen.
*/

/** Cuánta gente hay y cuánta usa la aplicación de verdad. */
export const AdminUsuariosSchema = z.object({
  total: z.number(),
  active: z.number(),
  inactive: z.number(),
  new_last_7_days: z.number(),
  new_last_30_days: z.number(),
  /*
    Cuántos registraron algún movimiento en los últimos 30 días. No es lo mismo
    que `active`: aquella dice quién puede entrar, esta quién vuelve. La
    distancia entre las dos es lo que dice si el producto retiene.
  */
  active_last_30_days: z.number(),
})

/** Cuánto se está usando: movimientos, bolsillos, categorías propias. */
export const AdminActividadSchema = z.object({
  transactions: z.number(),
  transactions_last_30_days: z.number(),
  accounts: z.number(),
  custom_categories: z.number(),
})

/** Lo que movió la plataforma este mes. Sin transferencias. */
export const AdminMesSchema = z.object({
  from: z.string(),
  to: z.string(),
  income: z.string(),
  expense: z.string(),
})

/** Una categoría del ranking, con cuántos gastos la usan. */
export const AdminCategoriaSchema = z.object({
  name: z.string(),
  count: z.number(),
})

/** GET /admin/stats — el estado de la plataforma. Solo `super_admin`. */
export const AdminStatsAPIResponseSchema = z.object({
  users: AdminUsuariosSchema,
  activity: AdminActividadSchema,
  this_month: AdminMesSchema,
  top_expense_categories: z.array(AdminCategoriaSchema),
})
