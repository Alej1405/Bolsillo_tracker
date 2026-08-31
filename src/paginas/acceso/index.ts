/*
  Formularios de entrar y de crear cuenta.

  Los usan dos pantallas —`paginas/acceso/Auth.tsx` en escritorio y
  `paginas/celular/Acceso.tsx` en móvil— con la misma lógica y distinto
  envoltorio.

  `RutaProtegida` no vive aquí: es infraestructura de enrutado y está en
  `app/`, junto a las rutas que protege.
*/
export { Campo } from '@/paginas/acceso/Campo'
export { FormularioLogin } from '@/paginas/acceso/FormularioLogin'
export { FormularioRegistro } from '@/paginas/acceso/FormularioRegistro'
