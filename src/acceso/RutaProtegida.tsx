import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { leerToken } from '@/utils/sesion'
import { useAppStore } from '@/stores/useAppStore'

/*
  Envuelve las rutas que exigen sesión.

  Tener token no basta: puede estar vencido o ser de un usuario que ya no
  existe. Se comprueba contra /auth/me una vez, y hasta que responde no se
  decide nada — redirigir antes echaría fuera a alguien con sesión válida.

  Quien llega sin sesión va a /login, y se recuerda de dónde venía en el
  `state` para devolverlo ahí después de entrar.
*/
export function RutaProtegida() {
  const { pathname } = useLocation()
  const usuario = useAppStore((e) => e.usuario)
  const cargarPerfil = useAppStore((e) => e.cargarPerfil)
  const [comprobando, setComprobando] = useState(() => !usuario && Boolean(leerToken()))

  useEffect(() => {
    if (!comprobando) return
    cargarPerfil()
      .catch(() => {
        // Token inválido o vencido: se cae al redirect de abajo.
      })
      .finally(() => setComprobando(false))
  }, [comprobando, cargarPerfil])

  if (comprobando) return null
  if (!usuario) return <Navigate to="/login" replace state={{ desde: pathname }} />

  return <Outlet />
}
