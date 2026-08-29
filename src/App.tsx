import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Cargador } from '@/movimiento'
import { useTipoPantalla } from '@/pantalla'
import { RutaProtegida } from '@/acceso'

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
const Landing = lazy(() => import('@/pages/Landing').then((m) => ({ default: m.Landing })))
const Auth = lazy(() => import('@/pages/Auth').then((m) => ({ default: m.Auth })))
const EnConstruccion = lazy(() =>
  import('@/pages/EnConstruccion').then((m) => ({ default: m.EnConstruccion })),
)
const AppCelular = lazy(() => import('@/celular').then((m) => ({ default: m.AppCelular })))
const Dashboard = lazy(() => import('@/dash/Dashboard').then((m) => ({ default: m.Dashboard })))

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
      <Cargador />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/registro" element={<Auth />} />
          <Route path="/en-construccion" element={<EnConstruccion />} />

          {/* Todo lo que cuelgue de aquí exige sesión. */}
          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
