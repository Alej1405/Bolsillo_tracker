import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Fondo } from '@/layout/landing/Fondo'
import { EnConstruccion } from '@/paginas/en-construccion/EnConstruccion'
import { Cargador } from '@/movimiento'
import { NavegacionInferior } from '@/layout/celular/NavegacionInferior'
import { Inicio } from '@/paginas/celular/Inicio'
import { QueHace } from '@/paginas/celular/QueHace'
import { Miralo } from '@/paginas/celular/Miralo'
import { Empezar } from '@/paginas/celular/Empezar'
import { Acceso } from '@/paginas/celular/Acceso'
import { ArmazonPanelCelular } from '@/layout/celular/ArmazonPanelCelular'
import { RutaDeAdmin, RutaDeCliente, RutaProtegida } from '@/app/RutaProtegida'
import { Bolsillos } from '@/paginas/panel/Bolsillos'
import { Consultas } from '@/paginas/panel/Consultas'
import { Dashboard } from '@/paginas/panel/Dashboard'
import { DashboardAdmin } from '@/paginas/panel/DashboardAdmin'
import { Historial } from '@/paginas/panel/Historial'
import { MiCuenta } from '@/paginas/panel/MiCuenta'
import { Rendimiento } from '@/paginas/panel/Rendimiento'
import { Reportes } from '@/paginas/panel/Reportes'
import { Sitio } from '@/paginas/panel/Sitio'
import { Soporte } from '@/paginas/panel/Soporte'
import { TiktokCallback } from '@/paginas/panel/TiktokCallback'
import { Usuarios } from '@/paginas/panel/Usuarios'
import { useAppStore } from '@/stores/useAppStore'

/** Qué panel toca al entrar, según quién eres. El mismo criterio que en escritorio. */
function InicioDelPanel() {
  const rol = useAppStore((e) => e.usuario?.role)
  return rol === 'super_admin' ? <DashboardAdmin /> : <Dashboard />
}

/**
 * Al cambiar de pantalla la vista vuelve arriba. Sin esto, entrar a "Míralo"
 * desde el final de "Qué hace" deja la pantalla nueva empezada por la mitad:
 * en una aplicación, tocar una pestaña siempre te deja al inicio de esa
 * pestaña. React Router no lo hace solo con `BrowserRouter`.
 */
function useVolverArriba() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
}

/**
 * La experiencia de celular. No es la landing maquetada de otro modo: tiene
 * sus propias pantallas, su propia navegación al pie y su propio recorrido.
 *
 * Lleva `Cargador` igual que escritorio: la moneda que gira y revienta es la
 * marca del producto, y el arranque es donde se presenta. Va fuera de `Routes`
 * a propósito, para que se vea una vez al entrar y no en cada cambio de
 * pestaña — un splash que se repite deja de ser marca y pasa a ser estorbo.
 */
/* Las rutas que viven dentro del panel y no llevan la barra de la landing. */
const RUTAS_DEL_PANEL = [
  '/dashboard',
  '/historial',
  '/bolsillos',
  '/reportes',
  '/rendimiento',
  '/soporte',
  '/mi-cuenta',
  '/usuarios',
  '/consultas',
  '/sitio',
  '/tiktok',
]

export function AppCelular() {
  useVolverArriba()
  const { pathname } = useLocation()
  const enElPanel = RUTAS_DEL_PANEL.some((r) => pathname.startsWith(r))

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/*
        La moneda solo en la parte pública, igual que en escritorio. Dentro del
        panel es un peaje de 3,5 s antes de ver tu saldo, y el teléfono es
        justo donde la aplicación se abre varias veces al día: medido, entrar
        al panel pasaba de 1,3 s en escritorio a 4,2 s aquí.
      */}
      {!enElPanel && <Cargador />}
      <Fondo />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/que-hace" element={<QueHace />} />
        <Route path="/miralo" element={<Miralo />} />
        <Route path="/empezar" element={<Empezar />} />
        <Route path="/registro" element={<Acceso />} />
        <Route path="/login" element={<Acceso />} />
        <Route path="/en-construccion" element={<EnConstruccion />} />

        {/*
          El panel, con su propio armazón: navegación al pie, cabecera de una
          línea y una hoja para lo que no cabe. Las pantallas son las mismas que
          en escritorio —mismos datos, mismas reglas— y lo que cambia es el
          marco, que es lo que separa una aplicación de una web estrechada.
        */}
        <Route element={<RutaProtegida />}>
          <Route element={<ArmazonPanelCelular />}>
            <Route path="/dashboard" element={<InicioDelPanel />} />
            <Route path="/mi-cuenta" element={<MiCuenta />} />

            <Route element={<RutaDeCliente />}>
              <Route path="/historial" element={<Historial />} />
              <Route path="/bolsillos" element={<Bolsillos />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/rendimiento" element={<Rendimiento />} />
              <Route path="/soporte" element={<Soporte />} />
            </Route>

            <Route element={<RutaDeAdmin />}>
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/consultas" element={<Consultas />} />
              <Route path="/sitio" element={<Sitio />} />
              <Route path="/tiktok/callback" element={<TiktokCallback />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/*
        La barra de la landing solo en la landing: dentro del panel manda la
        suya, que tiene otros destinos. Dos barras a la vez serían dos sitios
        distintos diciendo dónde estás.
      */}
      {!enElPanel && <NavegacionInferior />}
    </div>
  )
}
