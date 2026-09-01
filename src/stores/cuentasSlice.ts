import type { StateCreator } from 'zustand'
import {
  actualizarCuenta,
  archivarCuenta,
  desarchivarCuenta,
  borrarCuenta,
  crearCuenta,
  listarCuentas,
} from '@/services/CuentasService'
import type { Cuenta, DatosActualizarCuenta, DatosCrearCuenta } from '@/types'

/*
  Estado de los bolsillos: el CRUD completo.

  `cargarBolsillos` captura el error y lo guarda —la lista se pide sola al
  entrar, sin que nadie pulse nada, así que no hay un formulario esperando el
  fallo. Las otras cuatro lo dejan subir: quien las llama es un formulario o un
  diálogo de confirmación, y es él quien decide qué mensaje mostrar y dónde.

  Después de crear, editar, archivar o borrar se vuelve a pedir la lista en vez
  de retocarla en memoria. El patrimonio lo suma el backend, así que reconstruir
  aquí el total sería duplicar esa cuenta y arriesgarse a que discrepen.
*/
export type CuentasSliceType = {
  bolsillos: Cuenta[]
  patrimonio: string | null
  cargandoBolsillos: boolean
  errorBolsillos: string | null
  guardandoBolsillo: boolean
  /** El último bolsillo creado. Lo lee el aviso de la pantalla. */
  bolsilloCreado: Cuenta | null
  /*
    Si el popup de crear un bolsillo está abierto. Es estado global y no local
    de la pantalla de bolsillos porque se abre también desde el popup de anotar
    un gasto: sin bolsillos no se puede anotar, y encadenar los dos diálogos
    evita mandar a la persona a otra pantalla a medio camino.
  */
  crearAbierto: boolean
  /*
    Si la lista ya se pidió al servidor alguna vez. `bolsillos: []` no basta
    para saber si alguien no tiene ninguno: al arrancar también está vacía, y
    la bienvenida al primer bolsillo aparecería un instante a todo el mundo.
  */
  bolsillosPedidos: boolean

  cargarBolsillos: (incluirArchivados?: boolean) => Promise<void>
  crearBolsillo: (datos: DatosCrearCuenta) => Promise<Cuenta>
  editarBolsillo: (id: string, datos: DatosActualizarCuenta) => Promise<Cuenta>
  archivarBolsillo: (id: string) => Promise<void>
  desarchivarBolsillo: (id: string, incluirArchivados?: boolean) => Promise<void>
  borrarBolsillo: (id: string) => Promise<void>
  descartarBolsilloCreado: () => void
  abrirCrearBolsillo: () => void
  cerrarCrearBolsillo: () => void
}

export const createCuentasSlice: StateCreator<CuentasSliceType> = (set, get) => ({
  bolsillos: [],
  patrimonio: null,
  cargandoBolsillos: false,
  errorBolsillos: null,
  guardandoBolsillo: false,
  bolsilloCreado: null,
  crearAbierto: false,
  bolsillosPedidos: false,

  abrirCrearBolsillo: () => set({ crearAbierto: true }),
  cerrarCrearBolsillo: () => set({ crearAbierto: false }),

  cargarBolsillos: async (incluirArchivados = false) => {
    set({ cargandoBolsillos: true, errorBolsillos: null })
    try {
      const { items, total_balance } = await listarCuentas(incluirArchivados)
      set({ bolsillos: items, patrimonio: total_balance })
    } catch (error) {
      set({
        errorBolsillos: error instanceof Error ? error.message : 'No pudimos cargar tus bolsillos.',
      })
    } finally {
      set({ cargandoBolsillos: false, bolsillosPedidos: true })
    }
  },

  crearBolsillo: async (datos) => {
    set({ guardandoBolsillo: true })
    try {
      const cuenta = await crearCuenta(datos)
      set({ bolsilloCreado: cuenta })
      await get().cargarBolsillos()
      return cuenta
    } finally {
      set({ guardandoBolsillo: false })
    }
  },

  editarBolsillo: async (id, datos) => {
    set({ guardandoBolsillo: true })
    try {
      const cuenta = await actualizarCuenta(id, datos)
      await get().cargarBolsillos()
      return cuenta
    } finally {
      set({ guardandoBolsillo: false })
    }
  },

  archivarBolsillo: async (id) => {
    set({ guardandoBolsillo: true })
    try {
      await archivarCuenta(id)
      await get().cargarBolsillos()
    } finally {
      set({ guardandoBolsillo: false })
    }
  },

  /*
    Recibe `incluirArchivados` porque se desarchiva mirando la lista de
    archivados: si recargáramos sin el filtro, la vista se vaciaría de golpe
    justo cuando la persona acaba de actuar sobre ella.
  */
  desarchivarBolsillo: async (id, incluirArchivados = false) => {
    set({ guardandoBolsillo: true })
    try {
      await desarchivarCuenta(id)
      await get().cargarBolsillos(incluirArchivados)
    } finally {
      set({ guardandoBolsillo: false })
    }
  },

  borrarBolsillo: async (id) => {
    set({ guardandoBolsillo: true })
    try {
      await borrarCuenta(id)
      await get().cargarBolsillos()
    } finally {
      set({ guardandoBolsillo: false })
    }
  },

  descartarBolsilloCreado: () => set({ bolsilloCreado: null }),
})
