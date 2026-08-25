/*
  Regenera las capturas del README desde el sitio en producción.

    npm run capturas

  Usa Chrome en modo headless por línea de comandos, sin dependencias extra:
  añadir Playwright o Puppeteer solo para esto costaría cientos de megas.

  La página se captura entera en una ventana muy alta y luego se recorta. Es a
  propósito: con el viewport alto, todo queda "en vista" al cargar y las
  animaciones de scroll se disparan solas, así que las barras y las cifras
  salen en su estado final y no a medio contar.
*/
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, renameSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SITIO = process.env.SITIO ?? 'https://bolsillo.mashaec.net'
const DESTINO = new URL('../docs/', import.meta.url).pathname
const ANCHO = 1440
const ALTO_TOTAL = 7200

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((ruta) => {
  try { execFileSync('test', ['-x', ruta]); return true } catch { return false }
})

if (!CHROME) {
  console.error('No encontré Chrome. Instálalo o exporta CHROME=/ruta/al/binario.')
  process.exit(1)
}

// Recortes de la página completa, en píxeles: [arriba, abajo].
const SECCIONES = {
  'captura-hero.png': [0, 900],
  'captura-reportes.png': [1660, 2600],
  'captura-bolsillos.png': [2725, 3125],
}

const temp = mkdtempSync(join(tmpdir(), 'capturas-'))

function chrome(salida, url, ventana) {
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${ventana}`,
    '--virtual-time-budget=9000',
    `--screenshot=${salida}`,
    url,
  ], { stdio: 'ignore' })
}

try {
  console.log(`Capturando ${SITIO}…`)
  const completa = join(temp, 'completa.png')
  chrome(completa, SITIO, `${ANCHO},${ALTO_TOTAL}`)
  chrome(join(temp, 'acceso.png'), `${SITIO}/login`, `${ANCHO},900`)

  // sips viene con macOS; en Linux se usa ImageMagick.
  const esMac = process.platform === 'darwin'
  for (const [nombre, [arriba, abajo]] of Object.entries(SECCIONES)) {
    const alto = abajo - arriba
    const corte = join(temp, nombre)
    if (esMac) {
      execFileSync('sips', ['-c', String(alto), String(ANCHO),
        '--cropOffset', String(arriba), '0', completa, '--out', corte], { stdio: 'ignore' })
    } else {
      execFileSync('convert', [completa, '-crop', `${ANCHO}x${alto}+0+${arriba}`, corte])
    }
    renameSync(corte, join(DESTINO, nombre))
    console.log(`  ${nombre}`)
  }
  renameSync(join(temp, 'acceso.png'), join(DESTINO, 'captura-acceso.png'))
  console.log('  captura-acceso.png')
  console.log('\nListo. Revisa docs/ antes de subirlas.')
} finally {
  rmSync(temp, { recursive: true, force: true })
}
