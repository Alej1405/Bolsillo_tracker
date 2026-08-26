import { Routes, Route } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { AppCelular } from '@/celular'
import { Cargador } from '@/movimiento'
import { useTipoPantalla } from '@/pantalla'

export function App() {
  const pantalla = useTipoPantalla()

  /*
    El celular no recibe la misma web maquetada de otro modo: recibe otra cosa,
    con sus propias pantallas y su navegación al pie. La tableta sigue viendo
    la de escritorio, que a ese ancho ya funciona.
  */
  if (pantalla === 'celular') return <AppCelular />

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
