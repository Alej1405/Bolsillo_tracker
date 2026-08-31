# Tareas

Levantado el 2026-08-30, tras la auditoría con las skills `impeccable`
(dos evaluaciones aisladas: revisión de diseño + detector) y `emil-design-eng`.

La auditoría puntuó el panel **17/40** en las heurísticas de Nielsen, mientras
el detector mecánico daba **0 hallazgos**. Nada de lo que sigue lo ve una
herramienta.

---

## Hecho — panel funcional (2026-08-30)

- **Los 13 tokens semánticos que faltaban**, con sus valores reales del UI Kit:
  `fondo-superficie-elevada`, `fondo-velo`, `borde-fuerte`, `borde-foco`,
  `accion-principal-presionada`, `accion-principal-sutil`, `accion-secundaria`,
  `accion-secundaria-encima`, `accion-inactiva`, `error`, `error-sutil`,
  `exito`, `exito-sutil`. Sin ellos se podía escribir una clase inexistente sin
  que nada fallara: Tailwind v4 no avisa, solo no genera la utilidad.
- **`radio-extra` pasó de 14 a 20px**, como en el UI Kit. Antes `grande` y
  `extra` eran ambos 14 y el sistema prometía una distinción que no existía.
- **Responsive real.** Fuera todos los `min-w` de artboard. Barra lateral en
  iconos hasta 1280, dos columnas desde 1024. Verificado con capturas a 1440,
  1280, 1024 y 800: sin scroll horizontal en ninguno.
- **Indicador de página actual.** El destino activo va en relleno sólido; antes
  usaba un token inexistente y quedaba más claro que los inactivos.
- **Rutas del nav** declaradas y apuntando a `EnConstruccion`, más ruta `*`.
  Se acabó la pantalla blanca sin salida al segundo clic.
- **Datos reales.** `datos/dash.ts` borrado; el panel consume
  `GET /reports/dashboard` por el store, con `adaptadores.ts` traduciendo la
  respuesta a lo que pintan las piezas. Los tres gráficos aceptan props y
  conservan los valores de vitrina como defaults, que es lo que usa la landing.
- **Estados de carga, error y vacío**, con esqueletos, aviso con reintento y
  textos propios en las tres zonas. Probado contra el backend real con una
  cuenta sin movimientos.
- **Interactividad de verdad**: los filtros filtran, la búsqueda es un
  `input[type=search]` que busca, la paginación pagina y se deshabilita en los
  extremos.
- **Accesibilidad**: `borde-fuerte` en los controles (el 3:1 de WCAG 1.4.11),
  áreas táctiles a 44px, `focus-visible` propio, el nombre del usuario en texto
  real en vez de un `aria-label` sobre un `<span>` sin rol.
- **Movimiento**: el `Cargador` ya no corre en el panel — eran ~3,5 s de splash
  antes de ver el saldo, en cada recarga. Las cifras y barras se pintan sin
  contar, lo que además arregló un fallo real: `useInView` no disparaba y los
  números se quedaban en cero. Filtros, páginas y enlaces tienen estado de
  presión.
- **Fondo**: el panel usa el papel de valores del sistema en variante `sereno`
  —el mismo guilloché, al 42% y con el degradado acortado— en vez del
  `bg-lavanda-100` plano, que además contradecía la nota del propio `Fondo`.
- **Coherencia**: la píldora de la cabecera muestra el neto con el mes como
  etiqueta, el mismo dato que el gráfico llama "Te sobró"; antes eran dos
  cifras distintas sobre el mismo mes. Y se formatea el `"0"` sin decimales que
  manda el backend.

---

## Pendiente

### Panel

- [ ] `text-texto-sobre-marca/80` en `CuantoTienes`: **3,94:1** a 11 y 13px,
      falla AA. Es una pieza compartida con la landing, así que tocarla afecta
      a las dos.
- [ ] Stagger de 40–60ms al montar las cuatro tarjetas.
- [ ] Las filas del historial no son pulsables. Editar un movimiento tocándolo
      es la acción evidente en un panel financiero, pero no hay a dónde ir
      todavía: añadir hover sin destino sería otra promesa falsa.
- [ ] El typo `Dashborad` del frame de Figma sigue citado en el comentario de
      `Dashboard.tsx`.
- [ ] El hueco vertical bajo la columna izquierda cuando hay pocos movimientos.
- [ ] Versiones de tablet y móvil del panel. **En celular el producto no existe
      todavía**: `AppCelular` no tiene ruta de panel y `*` redirige a la
      portada, así que quien se registró en su teléfono aterriza en el folleto.
      Va justo contra lo que diferencia a Mashacorp.

### Sistema de diseño

- [ ] `radio-extra` cambió a 20px: **revisar la landing**, que también lo usa.
- [ ] Tres tratamientos de borde entre tarjetas hermanas (`borde-sutil`,
      `borde-normal`, sin borde). La importancia no se lee del marco.
- [ ] La escala tipográfica tiene escalones de 1px (13/14/15/16/17) que el
      propio `index.css` reconoce como deuda.
- [ ] Sin `document.title` por ruta: la pestaña dice lo mismo en la landing y
      en el panel.

### Reorganización de carpetas — decidir si se queda

El 2026-08-30 se movió `src/` a una estructura por capas y quedó **a medio
acordar**: se pidió parar cuando ya estaba movida, y se dejó funcionando.
Compila, el dev server sirve las cinco rutas y la app monta. Respaldo del árbol
anterior en el scratchpad de esa sesión (`src-antes-de-reorganizar.tgz`).

```
src/
  app/          App, main, RutaProtegida        ← arranque y enrutado
  paginas/      landing/ (+secciones/), acceso/, panel/, celular/, en-construccion/
  layout/       landing/, panel/, celular/      ← armazones y navegación
  ui/           Boton, BotonIr, BotonEnviar, Modal
  piezas/       CuantoTienes, gráficos, filas, tarjetas
  movimiento/   efectos              ← intacto, según lo acordado
  services/ stores/ types/ utils/    ← intactos, convención fija
  datos/  pantalla/  assets/
```

- [ ] Decidir si se queda así o se revierte.
- [ ] Si se queda: revisar si `pantalla/` debería vivir dentro de otra capa.
- [ ] Se descartó Feature-Sliced Design porque manda servicios y estado dentro
      de cada slice, y eso rompe la convención de `services/stores/types/utils`
      en la raíz.

### Backend

- [ ] **`pool_pre_ping=True` en `create_engine`** (`app/core/database.py`). Sin
      esto, el primer registro o login después de que Postgres corte conexiones
      devuelve **500**. Reproducido: `psycopg.errors.AdminShutdown` en el log,
      primer intento 500 y el segundo 201.
- [ ] Contrato: `total_balance` viene `"0.00"` pero los cuatro valores de
      `summary` vienen `"0"`. Hoy lo compensa el frontend.

### Figma

- [ ] Faltan, tras la reorganización en tres páginas de prototipo: el frame
      `DASHBOARD` y las pantallas `En construcción` de tablet y escritorio (la
      de celular sí está).
- [ ] La barra de navegación de tablet dice "Qué es..?" y "¿Qué hace.?" y le
      **falta Contacto**; el código tiene los cuatro enlaces bien escritos.
- [ ] La página se llama `Prototippo Desktop`, con doble p.
