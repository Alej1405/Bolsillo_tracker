import { Revelar } from '@/movimiento'
import { FilaMovimiento } from '@/components/piezas'

export function SeccionQueEs() {
  return (
    <section id="que-es" className="px-4 py-24 md:px-8 lg:px-32.5">
      <div className="mx-auto flex max-w-295 flex-col gap-6">
        {/* Fila 1: titular sobre foto + celda de dato */}
        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <Revelar className="h-full">
            <div className="relative flex h-full min-h-85 flex-col justify-end overflow-hidden rounded-(--radius-extra) p-10">
              <img
                src="/hero-960.webp"
                srcSet="/hero-480.webp 480w, /hero-960.webp 960w"
                sizes="(max-width: 1024px) 100vw, 730px"
                loading="lazy"
                decoding="async"
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
              <div className="absolute inset-0 bg-lavanda-950/60" />
              <div className="relative">
                {/* text-titulo-mayor y no 36px: este h2 empataba con el h1 del
                    hero en escritorio y lo superaba en móvil. */}
                <h2 className="max-w-[440px] font-titulo text-titulo-mayor font-bold leading-tight text-texto-inverso">
                  Tu dinero, ordenado sin esfuerzo
                </h2>
                <p className="mt-4 max-w-[400px] text-cuerpo-amplio text-texto-inverso/85">
                  Lo que entra, lo que sale y lo que guardas, en un solo lugar.
                </p>
              </div>
            </div>
          </Revelar>

          <Revelar retraso={0.08} className="h-full">
            <div className="vidrio-oscuro flex h-full min-h-[340px] flex-col justify-between rounded-extra p-9">
              <div>
                <p className="font-cuerpo text-cifra font-bold leading-none text-texto-inverso">2</p>
                <p className="mt-2 text-cuerpo font-medium text-texto-inverso/85">
                  toques para registrar un gasto
                </p>
              </div>
              <div>
                <p className="font-titulo text-rotulo font-semibold text-texto-inverso">
                  Sin hojas de cálculo. Sin adivinar a fin de mes.
                </p>
                <p className="mt-2 text-cuerpo text-texto-inverso/85">
                  Registrar un movimiento toma dos toques: categoría y bolsillo.
                </p>
              </div>
            </div>
          </Revelar>
        </div>

        {/* Fila 2: demostración ancha + columna de dos celdas */}
        <div className="grid gap-6 lg:grid-cols-[1.65fr_1fr]">
          <Revelar>
            <div className="vidrio flex flex-col gap-5 rounded-extra p-9">
              <h3 className="font-titulo text-rotulo font-semibold text-texto-principal">
                Registra en segundos
              </h3>
              <p className="text-cuerpo text-texto-secundario">
                Anota un gasto o un ingreso sin salir de la pantalla principal. Cada movimiento queda
                con su categoría y su bolsillo.
              </p>
              <div className="flex flex-col gap-2">
                <FilaMovimiento
                  inicial="C"
                  nombre="Comida"
                  detalle="Efectivo · Hoy"
                  monto="− 12,75"
                  clase="gasto"
                />
                <FilaMovimiento
                  inicial="S"
                  nombre="Sueldo"
                  detalle="Banco · 1 sep"
                  monto="+ 820,00"
                  clase="ingreso"
                />
              </div>
            </div>
          </Revelar>

          <div className="flex flex-col gap-6">
            <Revelar retraso={0.06} className="flex-1">
              <div className="vidrio flex h-full flex-col justify-center rounded-extra p-7">
                <h3 className="font-titulo text-cuerpo-amplio font-semibold text-texto-principal">
                  Mira a dónde se va
                </h3>
                <p className="mt-2 text-nota text-texto-secundario">
                  Reparto por categoría y comparación mes a mes, ya calculados.
                </p>
              </div>
            </Revelar>
            <Revelar retraso={0.12} className="flex-1">
              <div className="vidrio flex h-full flex-col justify-center rounded-extra p-7">
                <h3 className="font-titulo text-cuerpo-amplio font-semibold text-texto-principal">
                  Cuida tus ahorros
                </h3>
                <p className="mt-2 text-nota text-texto-secundario">
                  Cada bolsillo aparte, para saber qué puedes gastar de verdad.
                </p>
              </div>
            </Revelar>
          </div>
        </div>
      </div>
    </section>
  )
}
