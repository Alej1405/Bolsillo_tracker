import { useEffect, useMemo, useState } from 'react'
import { Esperando } from '@/layout/panel/Esperando'
import { GraficoEntroSalio, GraficoMesAMes, GraficoReparto } from '@/piezas'
import { Boton } from '@/ui/Boton'
import { Cifra } from '@/ui/Cifra'
import { MESES, control, rangoDelMes, ultimosAnios } from '@/helpers'
import { aNumero } from '@/utils/moneda'
import { useAppStore } from '@/stores/useAppStore'

/**
 * Reportes: qué pasó en un periodo.
 *
 * Tres preguntas distintas y tres consultas distintas: cuánto entró y salió en
 * el mes elegido, en qué se fue ese mismo mes, y cómo va el año completo. Se
 * piden por separado porque cambian a ritmos distintos —el mes al elegir otro,
 * el año casi nunca— y unirlas obligaría a repetir las tres cada vez.
 *
 * Todo llega calculado del backend. Aquí solo se dibuja.
 */
export function Reportes() {
  const resumen = useAppStore((e) => e.resumen)
  const reparto = useAppStore((e) => e.reparto)
  const anual = useAppStore((e) => e.anual)
  const cargando = useAppStore((e) => e.cargandoReportes)
  const error = useAppStore((e) => e.errorReportes)
  const cargarResumen = useAppStore((e) => e.cargarResumen)
  const cargarReparto = useAppStore((e) => e.cargarReparto)
  const cargarAnual = useAppStore((e) => e.cargarAnual)

  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)

  const { desde, hasta } = useMemo(() => rangoDelMes(anio, mes), [anio, mes])

  useEffect(() => {
    void cargarResumen(desde, hasta)
    void cargarReparto(desde, hasta, 'expense')
  }, [cargarResumen, cargarReparto, desde, hasta])

  useEffect(() => {
    void cargarAnual(anio)
  }, [cargarAnual, anio])

  const meses = anual?.items.map((m) => ({
    entro: aNumero(m.income),
    salio: aNumero(m.expense),
  }))

  const categorias = (reparto?.items ?? []).map((c, i) => ({
    id: c.category.id,
    nombre: c.category.name,
    pct: c.percentage,
    monto: aNumero(c.amount),
    color: c.category.color ?? `var(--color-grafico-${(i % 5) + 1})`,
  }))

  const anios = ultimosAnios()

  return (
    <section className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">Reportes</h2>
          <p className="text-nota text-texto-tenue">
            {cargando
              ? 'Calculando…'
              : `${MESES[mes - 1]} de ${anio} · ${resumen?.transaction_count ?? 0} movimientos`}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mes-reporte" className="text-micro text-texto-tenue">
              Mes
            </label>
            <select
              id="mes-reporte"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className={control}
            >
              {MESES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="anio-reporte" className="text-micro text-texto-tenue">
              Año
            </label>
            <select
              id="anio-reporte"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className={control}
            >
              {anios.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-extra bg-gasto-sutil px-5 py-4">
          <p className="flex-1 text-cuerpo text-texto-principal">{error}</p>
          <Boton variante="secundario" onClick={() => void cargarResumen(desde, hasta)}>
            Reintentar
          </Boton>
        </div>
      )}

      {cargando ? (
        <div className="flex flex-col gap-5">
          <Esperando alto={104} />
          <Esperando alto={300} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Cifra etiqueta="Entró" monto={resumen?.total_income} tono="ingreso" />
            <Cifra etiqueta="Salió" monto={resumen?.total_expense} tono="gasto" />
            <Cifra etiqueta="Neto" monto={resumen?.net} />
            <Cifra etiqueta="Ahorrado" monto={resumen?.total_saved} />
          </div>

          <div className="flex flex-col items-start gap-5 lg:flex-row">
            <div className="w-full min-w-0 lg:flex-1">
              <GraficoEntroSalio
                animar={false}
                entro={aNumero(resumen?.total_income)}
                salio={aNumero(resumen?.total_expense)}
                neto={aNumero(resumen?.net)}
              />
            </div>
            <div className="w-full min-w-0 lg:flex-1">
              <GraficoReparto animar={false} categorias={categorias} />
            </div>
          </div>

          <GraficoMesAMes meses={meses} animar={false} />
        </>
      )}
    </section>
  )
}
