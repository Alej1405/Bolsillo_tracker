import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Cargador } from '@/movimiento'
import { useTipoPantalla } from '@/pantalla'
import { RutaDeAdmin, RutaDeCliente, RutaProtegida } from '@/app/RutaProtegida'
import { useAppStore } from '@/stores/useAppStore'

/*
  Cada rama se carga cuando hace falta, no toda de golpe al abrir la página.

  Sin esto, quien entra a leer la portada se descarga también el formulario de
  registro, el modal, los gráficos y las cuatro pantallas de celular. Son ramas
  que la mayoría de visitantes no llega a ver.

  El `fallback` es `null` a propósito y no un spinner: al arrancar, el
  `Cargador` ya tapa la pantalla entera durante dos segundos largos, que es más
  de lo que tarda cualquiera de estos trozos en llegar. Y al navegar dentro del
  sitio, el acuse del botón cubre el hueco. Un spinner ahí sería un parpadeo
  que solo avisa de que hubo un parpadeo.

  Los componentes se exportan con nombre, no por defecto: de ahí el `.then`
  que los envuelve, que es lo que `lazy` espera.
*/
const Landing = lazy(() => import('@/paginas/landing/Landing').then((m) => ({ default: m.Landing })))
const Auth = lazy(() => import('@/paginas/acceso/Auth').then((m) => ({ default: m.Auth })))
const EnConstruccion = lazy(() =>
  import('@/paginas/en-construccion/EnConstruccion').then((m) => ({ default: m.EnConstruccion })),
)
const AppCelular = lazy(() => import('@/layout/celular').then((m) => ({ default: m.AppCelular })))
const Dashboard = lazy(() => import('@/paginas/panel/Dashboard').then((m) => ({ default: m.Dashboard })))
const ArmazonPanel = lazy(() =>
  import('@/layout/panel/ArmazonPanel').then((m) => ({ default: m.ArmazonPanel })),
)
const Bolsillos = lazy(() =>
  import('@/paginas/panel/Bolsillos').then((m) => ({ default: m.Bolsillos })),
)
const Historial = lazy(() =>
  import('@/paginas/panel/Historial').then((m) => ({ default: m.Historial })),
)
const Reportes = lazy(() =>
  import('@/paginas/panel/Reportes').then((m) => ({ default: m.Reportes })),
)
const Rendimiento = lazy(() =>
  import('@/paginas/panel/Rendimiento').then((m) => ({ default: m.Rendimiento })),
)
const DashboardAdmin = lazy(() =>
  import('@/paginas/panel/DashboardAdmin').then((m) => ({ default: m.DashboardAdmin })),
)
const Soporte = lazy(() =>
  import('@/paginas/panel/Soporte').then((m) => ({ default: m.Soporte })),
)
const Consultas = lazy(() =>
  import('@/paginas/panel/Consultas').then((m) => ({ default: m.Consultas })),
)
const Sitio = lazy(() => import('@/paginas/panel/Sitio').then((m) => ({ default: m.Sitio })))
const TiktokCallback = lazy(() =>
  import('@/paginas/panel/TiktokCallback').then((m) => ({ default: m.TiktokCallback })),
)
const Usuarios = lazy(() =>
  import('@/paginas/panel/Usuarios').then((m) => ({ default: m.Usuarios })),
)
const MiCuenta = lazy(() =>
  import('@/paginas/panel/MiCuenta').then((m) => ({ default: m.MiCuenta })),
)

/** Qué panel toca al entrar, según quién eres. */
function Inicio() {
  const rol = useAppStore((e) => e.usuario?.role)
  return rol === 'super_admin' ? <DashboardAdmin /> : <Dashboard />
}

export function App() {
  const pantalla = useTipoPantalla()

  /*
    El celular no recibe la misma web maquetada de otro modo: recibe otra cosa,
    con sus propias pantallas y su navegación al pie. La tableta sigue viendo
    la de escritorio, que a ese ancho ya funciona.
  */
  if (pantalla === 'celular') {
    return (
      <Suspense fallback={null}>
        <AppCelular />
      </Suspense>
    )
  }

  return (
    <>
      <CargadorDeEntrada />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/registro" element={<Auth />} />
          <Route path="/en-construccion" element={<EnConstruccion />} />

          {/*
            Todo lo que cuelgue de aquí exige sesión y comparte el armazón del
            panel: la barra lateral y la cabecera no se desmontan al cambiar de
            pantalla, así que la navegación no parpadea y la cabecera puede
            decir en cuál estás.

            Los cinco destinos del nav tienen ya su pantalla. `Pendiente` se
            queda en `paginas/panel/` sin usar, listo para la próxima ruta que
            se declare antes de tener contenido.
          */}
          <Route element={<RutaProtegida />}>
            <Route element={<ArmazonPanel />}>
              {/*
                La misma ruta, dos pantallas. Un administrador entra a ver cómo
                va la plataforma, no sus gastos del mes. Con `lazy` cada rol
                descarga solo la suya.
              */}
              <Route path="/dashboard" element={<Inicio />} />
              {/* Finanzas personales: no las usa un administrador. */}
              <Route element={<RutaDeCliente />}>
                <Route path="/historial" element={<Historial />} />
                <Route path="/bolsillos" element={<Bolsillos />} />
                <Route path="/reportes" element={<Reportes />} />
                <Route path="/rendimiento" element={<Rendimiento />} />
                <Route path="/soporte" element={<Soporte />} />
              </Route>
              <Route path="/mi-cuenta" element={<MiCuenta />} />
              {/* Solo super_admin. `lazy` hace que un cliente ni descargue este código. */}
              <Route element={<RutaDeAdmin />}>
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/consultas" element={<Consultas />} />
                <Route path="/sitio" element={<Sitio />} />
                {/* A donde vuelve TikTok tras autorizar. */}
                <Route path="/tiktok/callback" element={<TiktokCallback />} />
              </Route>
            </Route>
          </Route>

          {/* Cualquier otra dirección vuelve a la portada. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

/*
  La moneda que gira es la presentación de la marca, y eso ocurre al llegar al
  sitio. Dentro de la aplicación es un peaje: son ~3,5 s antes de ver tu saldo,
  y el panel se abre varias veces al día.
*/
const PUBLICAS = ['/', '/login', '/registro']

function CargadorDeEntrada() {
  const { pathname } = useLocation()
  if (!PUBLICAS.includes(pathname)) return null
  return <Cargador />
}
