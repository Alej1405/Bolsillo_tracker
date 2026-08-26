---
target: el hero de la landing
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-26T20-45-47Z
slug: src-components-hero-tsx
---
# Crítica de diseño — Hero de Bolsillo
Method: dual-agent (A: revisión de diseño · B: detector + evidencia de navegador)
Superficie: Persuade. Fecha: 2026-08-26.

## Puntaje: 18/40 — Pobre (rediseño, no pulida)
| # | Heurística | Puntaje | Hallazgo |
|---|---|---|---|
| 1 | Visibilidad del estado | 2 | Nada insinúa continuación bajo el pliegue |
| 2 | Correspondencia mundo real | 1 | Monedas sin denominación; "Nosotros" → #como-funciona |
| 3 | Control y libertad | 3 | Las dos acciones expulsan a autenticación |
| 4 | Consistencia | 3 | Primario y secundario renderizan idénticos |
| 5 | Prevención de errores | 1 | "Estás a un click" promete lo que el registro rompe |
| 6 | Reconocer > recordar | 1 | El logotipo se lee "olsillo" |
| 7 | Flexibilidad | 2 | "Ingresar" se camufla con el CTA |
| 8 | Estético/minimalista | 2 | Medio lienzo sin información |
| 9 | Recuperación de errores | 2 | El clic equivocado no tiene salida |
| 10 | Ayuda y documentación | 1 | La explicación vive 700px abajo |
Ninguna n/a. Máximo aplicable: 40.

## Veredicto de especificidad: NO PASA
Composición intercambiable con banco/aseguradora/cooperativa/fintech. El guilloché de
Fondo.tsx (activo de marca, 60 líneas justificándolo) queda tapado por foto de stock.
El producto no aparece: cero cifras, categorías o filas de movimiento en la 1ª pantalla.

Detector CLI: [] limpio. Detector de navegador: 19 anti-patrones sobre el DOM resuelto.
- dark-glow → Boton.tsx:19 (sombra lavanda-900 en CTA). Coincide con la revisión de diseño.
- line-length → SeccionQueEs.tsx:60 (87 chars).
- overused-font → Inter 88%. Ya suprimido: viene del UI Kit de Figma.
- FALSO POSITIVO verificado: gradient-text sobre body (backgroundClip border-box, sin bg-clip-text).
- Fuera de alcance: undersized-ui-text ×10 (GraficoMesAMes 10px), gpt-thin-border-wide-shadow ×3
  (SeccionTikToks), nested-cards (piezas/).
Overlays: inyección OK pero en headless por restricción de GPU. Sin overlay visible en el navegador del usuario.

## Fortalezas
1. Fondo.tsx: guilloché argumentado (grabado del billete + retícula del libro mayor). Activo de marca.
2. Disciplina de tokens: escala lavanda extraída de la foto, easing espejado CSS/TS.
3. Rejilla de una celda: el contenedor crece con el texto en vez de recortarlo.

## Problemas prioritarios
[P1] El hero no muestra el producto. Fix: dos columnas, FilaMovimiento (ya existe) a la derecha,
     foto a media columna, guilloché respirando. Cero componentes nuevos. → /impeccable shape
[P1] h1 más pequeño que el h2 siguiente. La escala tokenizada topa en --text-portada:36px y
     SeccionQueEs usa text-[36px] fijo. Móvil: h1=26px vs h2=36px. Falta tamaño de despliegue.
     Además tracking negativo sobre versalitas. → /impeccable typeset
[P1] CTA menos visible que el login, y gemelo suyo. Dos píldoras idénticas; la dominante va a
     /login. Fix: relleno lavanda-900, radio grande, sombra tinta-900, degradar "Ingresar". → /impeccable bolder
[P2] Tres mensajes antes del CTA con espaciado casi igual (mt-4/mt-3). "Estás a un click" es falso.
     Fix: borrar el segundo párrafo, afirmar en vez de preguntar. → /impeccable clarify
[P2] 350px de flores muertas bajo el CTA; la foto se repite en SeccionQueEs (preexistente, no
     introducido por la unificación de imágenes). → /impeccable layout

## Personas
Dayana (20, PUCE, WhatsApp): lee "olsillo", no percibe el h1, tres preguntas sin respuesta, foto repetida.
Kevin (26, quemado de apps): busca prueba de menos trabajo, no hay dato operativo; el "2 toques" está bajo el pliegue.
Sofía (29, cauta con datos): "¿Qué es?"/"Nosotros"/"¿Qué hace?" son sinónimos, "Nosotros" miente sobre su destino.

## Menores
lg:px-[130px] mágico · todo flota, nada a sangre · .vidrio-secundario al 1% casi invisible sobre la foto
· "Toma el Control" → "Toma el control" · "click" → "clic" · --text-portada quedará mal nombrado.

## Pendiente de confirmación del usuario
Varias propuestas introducen la palabra "gratis". NO confirmado que Bolsillo sea gratis.
