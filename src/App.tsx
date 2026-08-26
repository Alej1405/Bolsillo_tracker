import { Routes, Route } from 'react-router-dom'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { Cargador } from '@/movimiento'

export function App() {
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
