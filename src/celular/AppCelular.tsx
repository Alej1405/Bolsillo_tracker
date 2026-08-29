import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Fondo } from '@/components/Fondo'
import { EnConstruccion } from '@/pages/EnConstruccion'
import { Cargador } from '@/movimiento'
import { NavegacionInferior } from '@/celular/NavegacionInferior'
import { Inicio } from '@/celular/pantallas/Inicio'
import { QueHace } from '@/celular/pantallas/QueHace'
import { Miralo } from '@/celular/pantallas/Miralo'
import { Empezar } from '@/celular/pantallas/Empezar'
import { Acceso } from '@/celular/pantallas/Acceso'

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
export function AppCelular() {
  useVolverArriba()

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Cargador />
      <Fondo />

      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/que-hace" element={<QueHace />} />
        <Route path="/miralo" element={<Miralo />} />
        <Route path="/empezar" element={<Empezar />} />
        <Route path="/registro" element={<Acceso />} />
        <Route path="/login" element={<Acceso />} />
        <Route path="/en-construccion" element={<EnConstruccion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <NavegacionInferior />
    </div>
  )
}
