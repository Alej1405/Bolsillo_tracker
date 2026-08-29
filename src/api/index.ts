/*
  Puerta de entrada a la API. Las pantallas importan de '@/api', nunca de los
  archivos sueltos, igual que con '@/datos'.
*/
export { pedir, ErrorApi, ErrorDeRed } from '@/api/cliente'
export type { FalloDeCampo } from '@/api/cliente'
export { registrar } from '@/api/auth'
export type { DatosRegistro, Usuario, RespuestaAcceso } from '@/api/auth'
export { guardarToken, leerToken, borrarToken } from '@/api/sesion'
