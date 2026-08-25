import { Revelar } from '@/movimiento'
import { Boton } from '@/components/ui/Boton'

export function SeccionRegistro() {
  return (
    <section id="registro" className="px-4 py-24 md:px-8 lg:px-[130px]">
      <Revelar className="mx-auto max-w-[1180px]">
        <div className="vidrio-oscuro flex flex-col items-center rounded-[var(--radius-maximo)] px-6 py-16 text-center md:px-20">
          <h2 className="max-w-[640px] font-titulo text-[20px] font-extrabold leading-tight text-texto-inverso md:text-[48px]">
            Toma el control de tu dinero
          </h2>
          <p className="mt-4 max-w-[560px] text-[17px] text-texto-inverso/80">
            Crea tu cuenta gratis y registra tu primer movimiento hoy mismo.
          </p>

          <form
            className="mt-8 flex w-full max-w-[520px] flex-col items-center gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="w-full flex-1 text-left">
              <label htmlFor="correo" className="sr-only">
                Tu correo
              </label>
              <input
                id="correo"
                type="email"
                placeholder="nombre@correo.com"
                className="h-[52px] w-full rounded-[var(--radius-grande)] bg-fondo-superficie px-4 text-[15px] text-texto-principal outline-none placeholder:text-texto-tenue focus:ring-2 focus:ring-lavanda-400"
              />
            </div>
            <Boton to="/registro" className="w-full sm:w-auto">
              Crear cuenta gratis
            </Boton>
          </form>

          <p className="mt-4 text-[13px] text-texto-inverso/60">
            Sin tarjeta de crédito. Cancelas cuando quieras.
          </p>
        </div>
      </Revelar>
    </section>
  )
}
