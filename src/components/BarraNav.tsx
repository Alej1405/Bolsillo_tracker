import logo from '@/assets/logo.png'
import { Boton } from '@/components/ui/Boton'

const enlaces = [
  { texto: '¿Qué es?', destino: '#que-es' },
  { texto: 'Nosotros', destino: '#como-funciona' },
  { texto: '¿Qué hace?', destino: '#que-hace' },
  { texto: 'Contacto', destino: '#contacto' },
]

export function BarraNav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 w-full">
      <nav className=" vidrio-secundario  pointer-events-auto flex h-16 w-full max-w-300 items-center justify-between rounded-full pl-6 pr-4 ">
        <a href="#inicio" className="flex items-center gap-1" aria-label="Bolsillo, inicio">
          <img src={logo} alt="" className="h-8 w-5.5 object-contain" />
          <span className="font-titulo text-[22px] font-bold tracking-[0.045em] text-marca-800">
            olsillo
          </span>
        </a>

        <ul className="hidden items-center gap-20 md:flex">
          {enlaces.map((e) => (
            <li key={e.destino}>
              <a
                href={e.destino}
                className="text-[15px] font-medium text-texto-secundario transition-colors hover:text-texto-principal"
              >
                {e.texto}
              </a>
            </li>
          ))}
        </ul>

        <Boton to="/login" tamano="mediano" className="h-9 px-4 text-[14px] font-light">
          Ingresar
        </Boton>
      </nav>
    </header>
  )
}
