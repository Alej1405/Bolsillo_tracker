import { useEffect } from 'react'
import { ArrowRightIcon, UsersThreeIcon } from '@phosphor-icons/react'
import { Esperando, EsperandoLista } from '@/layout/panel/Esperando'
import { iniciales, nombreDelMes } from '@/helpers'
import { Boton } from '@/ui/Boton'
import { Cifra } from '@/ui/Cifra'
import { useAppStore } from '@/stores/useAppStore'
import type { UsuarioAdmin } from '@/types'

/** "2026-08-31T…" → "31 ago". La fecha de alta, corta. */
function cuando(iso: string): string {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

/** Una línea de la lista de altas recientes. */
function Alta({ usuario }: { usuario: UsuarioAdmin }) {
  return (
    <div className="flex items-center gap-3 rounded-grande bg-fondo-superficie px-4 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lavanda-200 text-nota font-semibold text-lavanda-950">
        {iniciales(usuario.full_name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-cuerpo font-medium text-texto-principal">{usuario.full_name}</p>
        <p className="truncate text-nota text-texto-tenue">{usuario.email}</p>
      </div>
      {!usuario.is_active && (
        <span className="rounded-full bg-aviso-sutil px-3 py-1 text-micro font-medium text-aviso uppercase">
          de baja
        </span>
      )}
      <span className="text-nota text-texto-tenue tabular-nums">{cuando(usuario.created_at)}</span>
    </div>
  )
}

/** Un dato suelto de la rejilla de actividad. */
function Dato({ etiqueta, valor }: { etiqueta: string; valor: number | string }) {
  return (
    <div className="flex flex-col gap-1 rounded-grande bg-fondo-sutil px-4 py-3">
      <p className="font-cuerpo text-cuerpo-amplio font-bold tabular-nums text-texto-principal">
        {valor}
      </p>
      <p className="text-nota text-texto-tenue">{etiqueta}</p>
    </div>
  )
}

/**
 * El inicio de quien administra la plataforma.
 *
 * Sustituye al panel de finanzas personales: un administrador entra a ver cómo
 * va Bolsillo, no cuánto gastó él en el mercado. Por eso tampoco tiene en su
 * barra bolsillos, historial, reportes ni rendimiento.
 *
 * Todo llega calculado de `GET /admin/stats` en una sola petición. Aquí no se
 * suma nada, ni siquiera los dados de baja —que son el complemento de los
 * activos—: esa cuenta la hace el backend y repetirla es arriesgarse a que
 * discrepen.
 *
 * La cifra que más dice de las cuatro de arriba es la última: cuánta gente
 * registró algo en los últimos treinta días. Registrarse es fácil, volver no, y
 * la distancia entre esa cifra y el total de cuentas es lo que separa captar de
 * retener.
 */
export function DashboardAdmin() {
  const usuarios = useAppStore((e) => e.usuarios)
  const stats = useAppStore((e) => e.estadisticas)
  const cargandoStats = useAppStore((e) => e.cargandoEstadisticas)
  const cargandoUsuarios = useAppStore((e) => e.cargandoUsuarios)
  const cargarUsuarios = useAppStore((e) => e.cargarUsuarios)
  const cargarEstadisticas = useAppStore((e) => e.cargarEstadisticas)

  useEffect(() => {
    void cargarUsuarios()
    void cargarEstadisticas()
  }, [cargarUsuarios, cargarEstadisticas])

  /* Las cinco más recientes: el backend ya las devuelve en ese orden. */
  const recientes = usuarios.slice(0, 5)
  const mes = stats?.this_month

  return (
    <section className="vidrio-transparente flex flex-1 flex-col gap-5 rounded-maximo p-5 md:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-titulo text-titulo-menor font-bold text-texto-principal">
          Cómo va Bolsillo
        </h2>
        <p className="text-nota text-texto-tenue">
          {cargandoStats ? 'Cargando…' : 'El estado de la plataforma'}
        </p>
      </div>

      {cargandoStats && !stats ? (
        <Esperando alto={120} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Cifra
            etiqueta="Cuentas"
            valor={String(stats?.users.total ?? 0)}
            ayuda="Registradas en total"
          />
          <Cifra
            etiqueta="Nuevas esta semana"
            valor={String(stats?.users.new_last_7_days ?? 0)}
            tono="ingreso"
            ayuda="Altas en los últimos 7 días"
          />
          <Cifra
            etiqueta="Usando la app"
            valor={String(stats?.users.active_last_30_days ?? 0)}
            ayuda="Registraron algo en 30 días"
          />
          <Cifra
            etiqueta="Dadas de baja"
            valor={String(stats?.users.inactive ?? 0)}
            ayuda="Conservan sus datos, no entran"
          />
        </div>
      )}

      <div className="flex flex-col items-start gap-5 xl:flex-row">
        <div className="flex w-full min-w-0 flex-col gap-4 rounded-extra bg-fondo-superficie p-5 xl:flex-1">
          <div className="flex flex-col gap-1">
            <h3 className="font-titulo text-cuerpo-amplio font-semibold text-texto-principal">
              Actividad
            </h3>
            <p className="text-nota text-texto-tenue">
              Lo que se ha registrado en toda la plataforma
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Dato etiqueta="Movimientos" valor={stats?.activity.transactions ?? 0} />
            <Dato
              etiqueta="En los últimos 30 días"
              valor={stats?.activity.transactions_last_30_days ?? 0}
            />
            <Dato etiqueta="Bolsillos" valor={stats?.activity.accounts ?? 0} />
            <Dato etiqueta="Categorías propias" valor={stats?.activity.custom_categories ?? 0} />
          </div>

          {/*
            Lo movido este mes por todos. Las transferencias no cuentan: pasar
            plata de un bolsillo propio a otro no es dinero que entre ni salga
            del sistema, y sumarlas inflaría las dos cifras con el mismo importe.
          */}
          {mes && (
            <div className="flex flex-col gap-2 rounded-grande bg-fondo-sutil px-4 py-3">
              <p className="text-micro tracking-[0.08em] text-texto-tenue uppercase">
                Movido en {nombreDelMes(mes.from.slice(0, 7)) || 'el mes'}
              </p>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <p className="font-cuerpo text-cuerpo-amplio font-bold tabular-nums text-ingreso">
                  + ${Number(mes.income).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </p>
                <p className="font-cuerpo text-cuerpo-amplio font-bold tabular-nums text-gasto">
                  − ${Number(mes.expense).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}

          {stats && stats.top_expense_categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-micro tracking-[0.08em] text-texto-tenue uppercase">
                En qué gasta la gente
              </p>
              {stats.top_expense_categories.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-3">
                  <span className="truncate text-nota text-texto-secundario">{c.name}</span>
                  <span className="text-nota text-texto-tenue tabular-nums">
                    {c.count} {c.count === 1 ? 'gasto' : 'gastos'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex w-full min-w-0 flex-col gap-4 rounded-extra bg-fondo-superficie p-5 xl:flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="font-titulo text-cuerpo-amplio font-semibold text-texto-principal">
                Últimas altas
              </h3>
              <p className="text-nota text-texto-tenue">Quién se registró más recientemente</p>
            </div>
            <Boton to="/usuarios" variante="secundario" tamano="mediano">
              Ver todos
              <ArrowRightIcon size={16} aria-hidden />
            </Boton>
          </div>

          {cargandoUsuarios ? (
            <EsperandoLista filas={5} alto={56} />
          ) : recientes.length > 0 ? (
            <div className="flex flex-col gap-2">
              {recientes.map((u) => (
                <Alta key={u.id} usuario={u} />
              ))}
            </div>
          ) : (
            <p className="flex flex-col items-center gap-3 rounded-grande border border-dashed border-borde-fuerte px-5 py-10 text-center text-cuerpo text-texto-secundario">
              <UsersThreeIcon size={28} aria-hidden className="text-texto-tenue" />
              Todavía no hay nadie registrado en Bolsillo.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
