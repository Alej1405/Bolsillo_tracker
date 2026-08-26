import { Routes, Route } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { EnConstruccion } from '@/pages/EnConstruccion'
import { Cargador } from '@/movimiento'
import { useTipoPantalla } from '@/pantalla'

export function App() {
  const pantalla = useTipoPantalla()

  /*
    El celular no recibe la misma web maquetada de otro modo: recibe otra cosa.
    Mientras la versión de app no exista, recibe la pantalla de construcción.
    La tableta sigue viendo la de escritorio, que a ese ancho ya funciona.
  */
  if (pantalla === 'celular') return <EnConstruccion />

  return (
    <>
      <Cargador />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/registro" element={<Auth />} />
      </Routes>
    </>
  )
}
