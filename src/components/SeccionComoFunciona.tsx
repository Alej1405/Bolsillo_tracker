import { Revelar } from '@/movimiento'

const pasos = [
  {
    titulo: 'Crea tus bolsillos',
    cuerpo:
      'Efectivo, banco, tarjeta y ahorro. Pones el saldo con el que arrancas y ya está listo para usarse.',
  },
  {
    titulo: 'Registra lo que pasa',
    cuerpo:
      'Cada gasto o ingreso entra con su categoría y su bolsillo. No hay formularios largos ni campos obligatorios de más.',
  },
  {
    titulo: 'Lee tus reportes',
    cuerpo:
      'La aplicación arma el reparto por categoría, el mes a mes y lo que te queda disponible. Tú solo lees.',
  },
]

export function SeccionComoFunciona() {
  return (
    <section id="como-funciona" className="seccion py-24">
      <div className="contenedor flex flex-col gap-12">
        <Revelar>
          <h2 className="max-w-[620px] font-titulo text-portada font-bold text-texto-principal">
            Empezar toma tres minutos
          </h2>
        </Revelar>

        <Revelar retraso={0.08}>
          <ol className="vidrio flex flex-col rounded-maximo px-10">
            {pasos.map((p, i) => (
              <li
                key={p.titulo}
                className={`flex flex-col gap-6 py-10 md:flex-row md:gap-8 ${
                  i < pasos.length - 1 ? 'border-b border-borde-sutil' : ''
                }`}
              >
                <div className="flex items-center gap-4 md:w-[420px] md:items-start">
                  <span className="mt-2 size-3.5 shrink-0 rounded-full bg-accion-principal" />
                  <h3 className="font-titulo text-titulo-medio font-bold text-texto-principal">
                    {p.titulo}
                  </h3>
                </div>
                <p className="flex-1 pt-1 text-cuerpo-amplio text-texto-secundario">{p.cuerpo}</p>
              </li>
            ))}
          </ol>
        </Revelar>
      </div>
    </section>
  )
}
