import { useEffect, useMemo, useState } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { Esperando } from '@/layout/panel/Esperando'
import { TarjetaMedida } from '@/piezas'
import { Boton } from '@/ui/Boton'
import { Cifra } from '@/ui/Cifra'
import { MESES, rangoDelMes, selector, ultimosAnios } from '@/helpers'
import { useAppStore } from '@/stores/useAppStore'

/**
 * Rendimiento: cómo va tu dinero.
 *
 * Es la consolidación de los movimientos, no otra lista de ellos: las seis
 * medidas resumen en una frase lo que el historial cuenta fila por fila.
 *
 * Todo llega resuelto del backend —el número, la frase y el nivel—, así que
 * aquí no se calcula ni se interpreta nada. Si una medida cambiara de umbral,
 * cambia allá y esta pantalla no se entera, que es justo lo que se busca:
 * la regla de negocio vive en un solo sitio.
 */
export function Rendimiento() {
  const rendimiento = useAppStore((e) => e.rendimiento)
  const cargando = useAppStore((e) => e.cargandoRendimiento)
  const error = useAppStore((e) => e.errorRendimiento)
  const cargar = useAppStore((e) => e.cargarRendimiento)

  const hoy = new Date()
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [mes, setMes] = useState(hoy.getMonth() + 1)

  const { desde, hasta } = useMemo(() => rangoDelMes(anio, mes), [anio, mes])

  useEffect(() => {
    void cargar(desde, hasta)
  }, [cargar, desde, hasta])

  const anios = ultimosAnios()
  const medidas = rendimiento?.metrics ?? []

  return (
    <section className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">
            Cómo va tu dinero
          </h2>
          <p className="text-nota text-texto-tenue">
            {cargando ? 'Calculando…' : `${MESES[mes - 1]} de ${anio}`}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="mes-rendimiento" className="text-micro text-texto-tenue">
              Mes
            </label>
            <div className="relative">
              <select
                id="mes-rendimiento"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className={`${selector} w-full`}
              >
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
              <CaretDownIcon
                size={14}
                weight="bold"
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-texto-tenue"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="anio-rendimiento" className="text-micro text-texto-tenue">
              Año
            </label>
            <div className="relative">
              <select
                id="anio-rendimiento"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                className={`${selector} w-full`}
              >
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <CaretDownIcon
                size={14}
                weight="bold"
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-texto-tenue"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-extra bg-gasto-sutil px-5 py-4">
          <p className="flex-1 text-cuerpo text-texto-principal">{error}</p>
          <Boton variante="secundario" onClick={() => void cargar(desde, hasta)}>
            Reintentar
          </Boton>
        </div>
      )}

      {cargando ? (
        <div className="flex flex-col gap-5">
          <Esperando alto={104} />
          <Esperando alto={280} />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Cifra
              etiqueta="Lo que tienes"
              monto={rendimiento?.net_worth}
              ayuda="Todos tus bolsillos sumados: efectivo, banco, tarjeta y ahorro."
            />
            <Cifra
              etiqueta="Lo que guardaste este mes"
              monto={rendimiento?.saved_in_period}
              ayuda="Lo que entró menos lo que salió en el periodo elegido."
            />
          </div>

          {medidas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {medidas.map((m) => (
                <TarjetaMedida key={m.key} medida={m} />
              ))}
            </div>
          ) : (
            <p className="rounded-extra bg-fondo-superficie px-5 py-10 text-center text-cuerpo text-texto-secundario">
              Todavía no hay suficientes movimientos en este mes para sacar conclusiones. Anota
              algunos gastos y vuelve.
            </p>
          )}
        </>
      )}
    </section>
  )
}
