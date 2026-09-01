import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'

type Enlace = { texto: string; destino: string }

/*
  Cada destino apunta a algo que existe y que es distinto de sus vecinos.

  Lo que había antes no cumplía ninguna de las dos cosas: "Reportes" llevaba a
  la misma sección que "Qué hace", "Recuperar clave" a la pantalla de acceso
  —que no recupera nada, eso no existe todavía—, y "Ayuda" y "Privacidad" al
  principio de la página. Un enlace que no lleva a lo que promete gasta la
  confianza de quien lo pulsa, y en un pie de página se pulsa buscando
  precisamente lo que no se encontró arriba.
*/
const grupos: { titulo: string; enlaces: Enlace[] }[] = [
  {
    titulo: 'Producto',
    enlaces: [
      { texto: 'Qué es', destino: '/#que-es' },
      { texto: 'Qué hace', destino: '/#que-hace' },
      { texto: 'Bolsillos', destino: '/#bolsillos' },
      { texto: 'Cómo funciona', destino: '/#como-funciona' },
    ],
  },
  {
    titulo: 'Cuenta',
    enlaces: [
      { texto: 'Crear cuenta', destino: '/registro' },
      { texto: 'Ingresar', destino: '/login' },
    ],
  },
  {
    titulo: 'Soporte',
    enlaces: [
      { texto: 'Contacto', destino: '/#contacto' },
      { texto: 'Míralo funcionando', destino: '/#tiktoks' },
    ],
  },
]

const CLASE_ENLACE =
  'inline-flex min-h-11 items-center text-nota text-texto-inverso/60 transition-colors hover:text-texto-inverso'

/**
 * Un enlace del pie, por el camino que corresponda a su destino.
 *
 * Los que apuntan a una sección de la propia landing van como ancla normal, no
 * por el router: `<Link to="/#que-es">` cambiaba la barra de direcciones y
 * dejaba la página exactamente donde estaba, porque react-router no desplaza
 * al ancla por su cuenta. Los seis enlaces de sección del pie no llevaban a
 * ninguna parte —comprobado— mientras los mismos de la barra de arriba sí,
 * que ya usan `<a href="#…">`.
 *
 * Los que van a otra pantalla sí necesitan el router, para no recargar.
 */
function EnlaceDelPie({ texto, destino }: Enlace) {
  const ancla = destino.includes('#')

  if (ancla) {
    return (
      <a href={destino} className={CLASE_ENLACE}>
        {texto}
      </a>
    )
  }

  return (
    <Link to={destino} className={CLASE_ENLACE}>
      {texto}
    </Link>
  )
}

export function PieDePagina() {
  return (
    <footer className="seccion bg-lavanda-950 pb-10 pt-16 text-texto-inverso">
      <div className="contenedor">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-[380px]">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-8 w-[22px] object-contain" />
              <span className="font-titulo text-titulo-menor font-bold tracking-[0.045em]">olsillo</span>
            </div>
            <p className="mt-3 text-nota leading-relaxed text-texto-inverso/65">
              Bolsillo es una aplicación para llevar tus finanzas personales sin complicarte:
              registra, reparte y entiende en qué se te va el dinero.
            </p>
          </div>

          {grupos.map((g) => (
            <div key={g.titulo}>
              <p className="text-micro font-semibold uppercase tracking-[0.08em] text-texto-inverso">
                {g.titulo}
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {g.enlaces.map((e) => (
                  <li key={e.texto}>
                    <EnlaceDelPie {...e} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 h-px w-full bg-white/15" />

        <div className="mt-6 flex flex-col justify-between gap-2 text-micro text-texto-inverso/50 sm:flex-row">
          <span>© 2026 Bolsillo · MashaCorp</span>
          <span>Hecho en Ecuador</span>
        </div>
      </div>
    </footer>
  )
}
