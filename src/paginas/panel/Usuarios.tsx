import { useEffect, useState } from 'react'
import { ProhibitIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { EsperandoLista } from '@/layout/panel/Esperando'
import { iniciales } from '@/helpers'
import { Paginacion } from '@/piezas'
import { Boton } from '@/ui/Boton'
import { Cifra } from '@/ui/Cifra'
import { Ficha } from '@/ui/Ficha'
import { Modal } from '@/ui/Modal'
import { Pista } from '@/ui/Pista'
import { useAppStore } from '@/stores/useAppStore'
import type { UsuarioAdmin } from '@/types'

type Filtro = 'todos' | 'activos' | 'inactivos'

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'todos', texto: 'Todos' },
  { id: 'activos', texto: 'Activos' },
  { id: 'inactivos', texto: 'Dados de baja' },
]

/** El filtro de la pantalla, traducido a lo que entiende el backend. */
function comoFiltro(filtro: Filtro): boolean | null {
  if (filtro === 'activos') return true
  if (filtro === 'inactivos') return false
  return null
}

const ACCION =
  'grid size-11 place-items-center rounded-medio border border-borde-fuerte bg-fondo-superficie text-texto-secundario transition-colors hover:bg-fondo-sutil focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none'

/** Una fila del listado: quién es, en qué estado está y qué se puede hacer. */
function Fila({
  usuario,
  ocupado,
  esTuCuenta,
  onCambiarEstado,
  onBorrar,
}: {
  usuario: UsuarioAdmin
  ocupado: boolean
  esTuCuenta: boolean
  onCambiarEstado: () => void
  onBorrar: () => void
}) {
  const activo = usuario.is_active

  return (
    <article
      className={`flex flex-wrap items-center gap-4 rounded-extra bg-fondo-superficie px-5 py-4 ${
        activo ? '' : 'opacity-60'
      }`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-lavanda-200 text-nota font-semibold text-lavanda-950">
        {iniciales(usuario.full_name)}
      </span>

      <div className="min-w-0 flex-1">
        {/* `truncate`: el nombre y el correo los escribe la persona. */}
        <p className="truncate text-cuerpo font-medium text-texto-principal">
          {usuario.full_name}
          {esTuCuenta && (
            <span className="ml-2 text-micro text-texto-tenue uppercase">tú</span>
          )}
        </p>
        <p className="truncate text-nota text-texto-tenue">{usuario.email}</p>
      </div>

      <div className="flex items-center gap-2">
        {usuario.role === 'super_admin' && (
          <span className="rounded-full bg-lavanda-100 px-3 py-1 text-micro font-medium text-lavanda-950 uppercase">
            admin
          </span>
        )}
        <span
          className={`rounded-full px-3 py-1 text-micro font-medium uppercase ${
            activo ? 'bg-ingreso-sutil text-ingreso' : 'bg-aviso-sutil text-aviso'
          }`}
        >
          {activo ? 'activo' : 'de baja'}
        </span>
      </div>

      {/*
        Sobre la propia cuenta no se ofrece nada: desactivarte a ti mismo te
        dejaría fuera sin manera de volver, y borrarte se llevaría por delante
        todos tus datos. Para darse de baja está Mi cuenta, que avisa de lo que
        implica.
      */}
      <div className="flex items-center gap-2">
        <Pista texto={activo ? 'Dar de baja' : 'Reactivar'}>
          <button
            type="button"
            onClick={onCambiarEstado}
            disabled={ocupado || esTuCuenta}
            className={ACCION}
          >
            <ProhibitIcon size={18} aria-hidden />
            <span className="sr-only">
              {activo ? 'Dar de baja a' : 'Reactivar a'} {usuario.full_name}
            </span>
          </button>
        </Pista>

        <Pista texto="Borrar definitivamente">
          <button
            type="button"
            onClick={onBorrar}
            disabled={ocupado || esTuCuenta}
            className={`${ACCION} hover:border-gasto hover:text-gasto`}
          >
            <TrashIcon size={18} aria-hidden />
            <span className="sr-only">Borrar definitivamente a {usuario.full_name}</span>
          </button>
        </Pista>
      </div>
    </article>
  )
}

/**
 * Administración de usuarios. Solo la ve `super_admin`.
 *
 * Existe por algo que hoy no se puede hacer de ninguna otra forma: reactivar a
 * quien se dio de baja. El propio interesado no puede —queda fuera del sistema—
 * y no hay ninguna otra pantalla que lo permita.
 *
 * Las dos acciones no son la misma cosa y por eso se ven distintas. Dar de baja
 * es reversible: la cuenta deja de entrar y sus datos quedan intactos. Borrar
 * arrastra en cascada bolsillos, categorías y movimientos, y no hay vuelta:
 * por eso pide confirmación escribiendo el correo.
 *
 * Quién puede entrar aquí lo decide el backend en cada petición. Esta pantalla
 * no protege nada: solo evita ofrecer lo que se iba a rechazar con un 403.
 */
export function Usuarios() {
  const yo = useAppStore((e) => e.usuario)
  const usuarios = useAppStore((e) => e.usuarios)
  const total = useAppStore((e) => e.totalUsuarios)
  const paginas = useAppStore((e) => e.paginasUsuarios)
  const stats = useAppStore((e) => e.estadisticas)
  const cargando = useAppStore((e) => e.cargandoUsuarios)
  const error = useAppStore((e) => e.errorUsuarios)
  const ocupadoCon = useAppStore((e) => e.ocupadoCon)
  const cargarUsuarios = useAppStore((e) => e.cargarUsuarios)
  const cargarEstadisticas = useAppStore((e) => e.cargarEstadisticas)
  const cambiarEstado = useAppStore((e) => e.cambiarEstado)
  const borrarParaSiempre = useAppStore((e) => e.borrarUsuarioParaSiempre)

  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [pagina, setPagina] = useState(1)
  const [porBorrar, setPorBorrar] = useState<UsuarioAdmin | null>(null)
  const [confirmacion, setConfirmacion] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    void cargarUsuarios(pagina, comoFiltro(filtro))
  }, [cargarUsuarios, pagina, filtro])

  useEffect(() => {
    void cargarEstadisticas()
  }, [cargarEstadisticas])

  const cambiarFiltro = (f: Filtro) => {
    setFiltro(f)
    setPagina(1)
  }

  const alCambiarEstado = async (u: UsuarioAdmin) => {
    setAviso(null)
    try {
      await cambiarEstado(u.id, !u.is_active)
      setAviso(
        u.is_active
          ? `${u.full_name} ya no puede entrar. Sus datos siguen intactos.`
          : `${u.full_name} vuelve a tener acceso.`,
      )
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No pudimos cambiar el estado.')
    }
  }

  const cerrarBorrado = () => {
    setPorBorrar(null)
    setConfirmacion('')
  }

  const alBorrar = async () => {
    if (!porBorrar) return
    setAviso(null)
    try {
      await borrarParaSiempre(porBorrar.id)
      setAviso(`Borramos la cuenta de ${porBorrar.full_name} y todo lo que tenía dentro.`)
      cerrarBorrado()
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No pudimos borrar la cuenta.')
    }
  }

  return (
    <section className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">Usuarios</h2>
        <p className="text-nota text-texto-tenue">
          {cargando ? 'Cargando…' : `${total} ${total === 1 ? 'cuenta' : 'cuentas'} en Bolsillo`}
        </p>
      </div>

      {/*
        Sin la cifra de activas: esa vive en la píldora de la cabecera, que se
        ve desde cualquier pantalla. Repetirla aquí sería decir dos veces lo
        mismo a un palmo de distancia.
        `valor` y no `monto`: son cuentas, no dinero.
      */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Cifra
          etiqueta="En total"
          valor={String(stats?.users.total ?? 0)}
          ayuda="Cuentas registradas"
        />
        <Cifra
          etiqueta="Dadas de baja"
          valor={String(stats?.users.inactive ?? 0)}
          ayuda="Conservan sus datos, no pueden entrar"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map((f) => (
          <Ficha
            key={f.id}
            texto={f.texto}
            activa={filtro === f.id}
            onClick={() => cambiarFiltro(f.id)}
          />
        ))}
      </div>

      {aviso && (
        <p role="status" className="rounded-extra bg-fondo-superficie px-5 py-4 text-cuerpo text-texto-secundario">
          {aviso}
        </p>
      )}

      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-extra bg-gasto-sutil px-5 py-4">
          <p className="flex-1 text-cuerpo text-texto-principal">{error}</p>
          <Boton variante="secundario" onClick={() => void cargarUsuarios(pagina, comoFiltro(filtro))}>
            Reintentar
          </Boton>
        </div>
      ) : cargando ? (
        <EsperandoLista filas={6} alto={72} />
      ) : usuarios.length > 0 ? (
        <div className="flex flex-col gap-2">
          {usuarios.map((u) => (
            <Fila
              key={u.id}
              usuario={u}
              ocupado={ocupadoCon === u.id}
              esTuCuenta={u.id === yo?.id}
              onCambiarEstado={() => void alCambiarEstado(u)}
              onBorrar={() => setPorBorrar(u)}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-extra bg-fondo-superficie px-5 py-10 text-center text-cuerpo text-texto-secundario">
          Ninguna cuenta con este filtro.
        </p>
      )}

      {!cargando && !error && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-nota text-texto-tenue">
            {usuarios.length} de {total}
          </p>
          <Paginacion pagina={pagina} paginas={paginas} ir={setPagina} variante="pasos" />
        </div>
      )}

      {/*
        Borrar pide escribir el correo entero. No es burocracia: esta es la
        única acción de toda la aplicación que destruye datos de otra persona
        sin vuelta atrás, y un clic de más en la fila equivocada no debe poder
        hacerlo.
      */}
      <Modal
        abierto={porBorrar !== null}
        onCerrar={cerrarBorrado}
        titulo="Borrar una cuenta para siempre"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3 rounded-extra bg-gasto-sutil px-5 py-4">
            <WarningCircleIcon size={20} weight="fill" aria-hidden className="mt-0.5 text-gasto" />
            <p className="flex-1 text-cuerpo leading-relaxed text-texto-principal">
              Vas a borrar la cuenta de{' '}
              <strong className="font-semibold">{porBorrar?.full_name}</strong> y con ella sus
              bolsillos, sus categorías y todos sus movimientos.{' '}
              <strong className="font-semibold">Esto no se puede deshacer.</strong> Si solo quieres
              que deje de entrar, dale de baja: es reversible y conserva sus datos.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmar-borrado" className="text-nota font-medium text-texto-principal">
              Escribe {porBorrar?.email} para confirmar
            </label>
            <input
              id="confirmar-borrado"
              type="text"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              autoComplete="off"
              className="h-11 rounded-grande border border-borde-fuerte bg-fondo-superficie px-4 text-cuerpo text-texto-principal outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Boton
              variante="peligro"
              onClick={() => void alBorrar()}
              disabled={confirmacion !== porBorrar?.email || ocupadoCon !== null}
            >
              Borrar para siempre
            </Boton>
            <Boton variante="secundario" onClick={cerrarBorrado}>
              Cancelar
            </Boton>
          </div>
        </div>
      </Modal>
    </section>
  )
}
