/*
  Experiencia de celular. Todo lo que solo existe en móvil vive aquí: sus
  pantallas, su navegación al pie y el cascarón que las une.

    AppCelular.tsx          cascarón: fondo, rutas y barra inferior
    NavegacionInferior.tsx  la barra al alcance del pulgar
    Pantalla.tsx            envoltorio común (título, entradilla, espacio para la barra)
    pantallas/              una por destino de la barra, más Acceso

  `pantallas/Acceso.tsx` es la excepción: no cuelga de la barra inferior y no
  reescribe los formularios — importa los de '@/acceso', los mismos que usa
  escritorio, y solo cambia el envoltorio.

  Lo que se comparte con escritorio NO entra aquí: las piezas del UI Kit siguen
  en '@/components/piezas' y los datos en '@/datos'.
*/
export { AppCelular } from '@/celular/AppCelular'
