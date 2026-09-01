import { z } from 'zod'
import { CategoriaMiniSchema } from '@/utils/dashboard-schema'

/*
  Schemas de /reports. Espejo de SummaryResponse, ByCategoryResponse y
  MonthlyResponse del backend.

  Todos los montos llegan como `string` ya resueltos y los porcentajes
  calculados: el backend calcula, el frontend formatea. Aquí no se suma ni se
  promedia nada.
*/

/** Periodo que cubre un reporte. */
export const PeriodoSchema = z.object({
  from: z.string(),
  to: z.string(),
})

/** GET /reports/summary — los totales de un rango de fechas. */
export const ResumenAPIResponseSchema = z.object({
  total_income: z.string(),
  total_expense: z.string(),
  net: z.string(),
  total_saved: z.string(),
  period: PeriodoSchema,
  transaction_count: z.number(),
})

/** Una categoría dentro del reparto, con sus subcategorías si las tiene. */
export const RepartoItemSchema: z.ZodType<{
  category: z.infer<typeof CategoriaMiniSchema>
  amount: string
  percentage: number
  transaction_count: number
  children: unknown[]
}> = z.lazy(() =>
  z.object({
    category: CategoriaMiniSchema,
    amount: z.string(),
    percentage: z.number(),
    transaction_count: z.number(),
    children: z.array(RepartoItemSchema).default([]),
  }),
)

/** GET /reports/by-category — en qué se fue, por categoría. */
export const RepartoAPIResponseSchema = z.object({
  period: PeriodoSchema,
  kind: z.string(),
  total: z.string(),
  items: z.array(RepartoItemSchema),
})

/** Un mes de la serie anual. */
export const MesSchema = z.object({
  month: z.string(),
  income: z.string(),
  expense: z.string(),
  net: z.string(),
  saved: z.string(),
})

/** GET /reports/monthly — los doce meses del año, con ceros donde no hubo nada. */
export const AnualAPIResponseSchema = z.object({
  year: z.number(),
  items: z.array(MesSchema),
})

/*
  Una medida de rendimiento. El backend no manda solo el número: manda además
  la frase ya redactada (`reading`) y el semáforo (`level`). Aquí no se
  interpreta nada, se pinta lo que llega — es la misma regla de siempre: el
  backend calcula, el frontend formatea.

  `value` llega como texto cuando es dinero y como número cuando es un
  porcentaje o una cantidad de meses. El dinero viaja en texto para que no lo
  redondee el punto flotante.
*/
export const MedidaSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  unit: z.string(),
  reading: z.string(),
  level: z.enum(['bien', 'atencion', 'mal']),
})

/** GET /reports/performance — cómo va el dinero, en seis medidas. */
export const RendimientoAPIResponseSchema = z.object({
  period: PeriodoSchema,
  saved_in_period: z.string(),
  net_worth: z.string(),
  metrics: z.array(MedidaSchema),
})
