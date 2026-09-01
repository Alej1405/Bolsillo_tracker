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

/*
  Lo mismo, y además con rol de administrador.

  Va anidada dentro de `RutaProtegida`, así que cuando se ejecuta ya hay sesión
  comprobada: aquí solo se mira el rol. Quien no lo tiene vuelve al panel, no a
  /login — tiene sesión válida, lo que no tiene es permiso, y mandarlo a la
  pantalla de entrar le haría pensar que se cayó la sesión.

  Esto no protege los datos: quien llame al endpoint a mano recibirá un 403 del
  backend igual. Evita enseñar una pantalla que solo daría errores.
*/
export function RutaDeCliente() {
  const usuario = useAppStore((e) => e.usuario)

  /*
    El reverso: las pantallas de finanzas personales no son para quien
    administra. Un `super_admin` que llegue aquí —por un enlace viejo o
    tecleando la ruta— va a su panel en vez de ver bolsillos y gastos que no
    vino a mirar.

    Sus datos no corren peligro si entrara: son los suyos propios. Esto es
    coherencia, no seguridad.
  */
  if (usuario?.role === 'super_admin') return <Navigate to="/dashboard" replace />

  return <Outlet />
}

export function RutaDeAdmin() {
  const usuario = useAppStore((e) => e.usuario)

  if (usuario?.role !== 'super_admin') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
