# Bolsillo · frontend

Landing y pantallas de acceso de Bolsillo. React 19 + TypeScript + Vite + Tailwind v4.
Se despliega aparte del backend: esto no se sirve desde la API.

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

## Estructura

```
src/
  movimiento/        capa de animación — todo lo que se mueve o reacciona al scroll
  components/
    ui/              controles reutilizables (Boton)
    piezas/          piezas del UI Kit portadas de Figma, una por archivo
    Seccion*.tsx     bloques de la landing, uno por sección
  pages/             Landing y Auth (login / registro comparten pantalla)
  index.css          tokens del sistema de diseño (@theme) y materiales (.vidrio)
```

## Dónde tocar cada cosa

**Ritmo de las animaciones** → `src/movimiento/curvas.ts`. Las curvas, las
duraciones y los umbrales de scroll están ahí y solo ahí. Cambiar `duracion.revelado`
cambia el revelado de toda la landing; ningún componente escribe un número suelto.

**Que un bloque aparezca al bajar** → envuélvelo en `<Revelar>`. Con `retraso`
escalonas hermanos de una misma fila.

**Que una cifra cuente o una barra crezca** → `<CifraAnimada>`, `<BarraVertical>`,
`<BarraHorizontal>`, todos de `@/movimiento`.

**Que algo entre al cargar y no al hacer scroll** → `useAparicion()`, como el Hero.

**Colores, tipografías, radios** → el bloque `@theme` de `index.css`. Los nombres
están en español, igual que en el archivo de Figma.

**El scroll suave de los enlaces del menú** → `scroll-behavior` en `index.css`.
Los enlaces de `BarraNav` apuntan al `id` de cada sección.

## Movimiento y accesibilidad

Todos los componentes de `movimiento/` respetan `prefers-reduced-motion`: con la
preferencia activa el contenido se muestra estático y **ya visible**. La
visibilidad nunca depende de que una animación llegue a correr.
