/*
  Acceso: los formularios de entrar y de crear cuenta.

  Viven aquí y no dentro de una pantalla porque los usan dos: la de escritorio
  (`pages/Auth.tsx`, con el panel que se desliza) y la de celular
  (`celular/pantallas/Acceso.tsx`, apilada). La lógica —validación, llamada a
  la API, aviso de éxito— es la misma; lo único que cambia es el envoltorio.
*/
export { Campo } from '@/acceso/Campo'
export { FormularioLogin } from '@/acceso/FormularioLogin'
export { FormularioRegistro } from '@/acceso/FormularioRegistro'
export { LIMITES, REQUISITOS, claveCompleta, validarRegistro } from '@/acceso/reglas'
export type { CamposRegistro, ErroresRegistro } from '@/acceso/reglas'
