import { Link } from 'react-router-dom'
import logo from '@/assets/logo.png'

type Enlace = { texto: string; destino: string }

const grupos: { titulo: string; enlaces: Enlace[] }[] = [
  {
    titulo: 'Producto',
    enlaces: [
      { texto: 'Qué es', destino: '/#que-es' },
      { texto: 'Qué hace', destino: '/#que-hace' },
      { texto: 'Bolsillos', destino: '/#bolsillos' },
      { texto: 'Reportes', destino: '/#que-hace' },
    ],
  },
  {
    titulo: 'Cuenta',
    enlaces: [
      { texto: 'Crear cuenta', destino: '/registro' },
      { texto: 'Ingresar', destino: '/login' },
      { texto: 'Recuperar clave', destino: '/login' },
    ],
  },
  {
    titulo: 'Soporte',
    enlaces: [
      { texto: 'Ayuda', destino: '/#inicio' },
      { texto: 'Contacto', destino: '/#contacto' },
      { texto: 'Privacidad', destino: '/#inicio' },
    ],
  },
]

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
                    <Link
                      to={e.destino}
                      className="text-nota text-texto-inverso/60 transition-colors hover:text-texto-inverso"
                    >
                      {e.texto}
                    </Link>
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
