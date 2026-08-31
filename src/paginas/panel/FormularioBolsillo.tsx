import { useState } from 'react'
import { BankIcon, CreditCardIcon, MoneyIcon, PiggyBankIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Campo } from '@/paginas/acceso'
import { Boton } from '@/ui/Boton'
import { ErrorApi } from '@/services/api'
import { aMontoDelBackend, formatearMonto } from '@/utils/moneda'
import { useAppStore } from '@/stores/useAppStore'
import type { Cuenta, TipoCuenta } from '@/types'

type Opcion = { tipo: TipoCuenta; etiqueta: string; Icono: Icon }

/* Los cuatro tipos del backend, con el nombre que usa la aplicación. */
const TIPOS: Opcion[] = [
  { tipo: 'cash', etiqueta: 'Efectivo', Icono: MoneyIcon },
  { tipo: 'bank', etiqueta: 'Banco', Icono: BankIcon },
  { tipo: 'card', etiqueta: 'Tarjeta', Icono: CreditCardIcon },
  { tipo: 'savings', etiqueta: 'Ahorro', Icono: PiggyBankIcon },
]

/**
 * Crear o editar un bolsillo.
 *
 * Con `bolsillo` edita, sin él crea. Es el mismo formulario porque es la misma
 * decisión —cómo se llama y qué es—, y separarlo obligaría a mantener dos
 * validaciones iguales.
 *
 * Al editar solo se cambia el nombre: el backend no deja tocar el tipo ni el
 * saldo inicial una vez creado, porque cambiarlos reescribiría el histórico.
 * El formulario lo dice en vez de mostrar campos que no van a guardar nada.
 */
export function FormularioBolsillo({
  bolsillo,
  onListo,
}: {
  bolsillo?: Cuenta
  onListo: (nombre: string) => void
}) {
  const crearBolsillo = useAppStore((e) => e.crearBolsillo)
  const editarBolsillo = useAppStore((e) => e.editarBolsillo)
  const guardando = useAppStore((e) => e.guardandoBolsillo)

  const editando = Boolean(bolsillo)

  const [nombre, setNombre] = useState(bolsillo?.name ?? '')
  const [tipo, setTipo] = useState<TipoCuenta>(bolsillo?.type ?? 'cash')
  const [saldo, setSaldo] = useState('')
  const [errores, setErrores] = useState<{ nombre?: string; saldo?: string }>({})
  const [aviso, setAviso] = useState<string | null>(null)

  const validar = () => {
    const fallos: { nombre?: string; saldo?: string } = {}
    if (!nombre.trim()) fallos.nombre = 'Ponle un nombre'
    else if (nombre.trim().length > 60) fallos.nombre = 'Máximo 60 caracteres'

    if (!editando && saldo.trim() && !/^-?\d{1,12}([.,]\d{1,2})?$/.test(saldo.trim())) {
      fallos.saldo = 'Escribe un monto válido, por ejemplo 120,50'
    }
    return fallos
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setAviso(null)

    const fallos = validar()
    setErrores(fallos)
    if (Object.keys(fallos).length > 0) return

    try {
      const cuenta = bolsillo
        ? await editarBolsillo(bolsillo.id, { name: nombre.trim() })
        : await crearBolsillo({
            name: nombre.trim(),
            type: tipo,
            ...(saldo.trim() ? { initial_balance: aMontoDelBackend(saldo) } : {}),
          })
      onListo(cuenta.name)
    } catch (error) {
      /*
        El 409 por nombre repetido se muestra sobre el campo, que es donde se
        arregla. El resto va al aviso general: no hay un campo al que culpar.
      */
      if (error instanceof ErrorApi && error.estado === 409) {
        setErrores({ nombre: 'Ya tienes un bolsillo con ese nombre' })
        return
      }
      setAviso(
        error instanceof Error
          ? error.message
          : 'No pudimos guardar el bolsillo. Inténtalo de nuevo.',
      )
    }
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      <Campo
        id="nombre-bolsillo"
        etiqueta="Nombre"
        placeholder="Mi efectivo"
        ayuda="Como lo reconoces tú: “Banco Pichincha”, “Viaje a la playa”."
        valor={nombre}
        onCambio={setNombre}
        error={errores.nombre}
      />

      {editando ? (
        <p className="rounded-medio bg-fondo-sutil px-4 py-3 text-nota text-texto-secundario">
          Este bolsillo es de tipo <strong className="font-semibold">{etiquetaDe(bolsillo!.type)}</strong>{' '}
          y arrancó con <strong className="font-semibold tabular-nums">$ {formatearMonto(bolsillo!.initial_balance)}</strong>.
          Ninguno de los dos se puede cambiar: reescribirían el histórico de saldos.
        </p>
      ) : (
        <>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-nota font-medium text-texto-principal">Tipo</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIPOS.map(({ tipo: t, etiqueta, Icono }) => {
                const elegido = t === tipo
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    aria-pressed={elegido}
                    className={`flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-medio border p-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-borde-foco active:scale-[0.97] ${
                      elegido
                        ? 'border-accion-principal bg-accion-principal text-texto-sobre-marca'
                        : 'border-borde-fuerte bg-fondo-superficie text-texto-secundario hover:bg-fondo-sutil'
                    }`}
                  >
                    <Icono size={20} weight={elegido ? 'fill' : 'regular'} aria-hidden />
                    <span className="text-nota font-medium">{etiqueta}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <Campo
            id="saldo-bolsillo"
            etiqueta="Saldo inicial"
            placeholder="0,00"
            ayuda="Opcional. Lo que tienes hoy en ese bolsillo. Escríbelo seguido: 1250,50."
            valor={saldo}
            onCambio={setSaldo}
            error={errores.saldo}
          />
        </>
      )}

      {aviso && (
        <p role="alert" className="rounded-medio bg-gasto-sutil px-4 py-3 text-nota text-gasto">
          {aviso}
        </p>
      )}

      <Boton type="submit" disabled={guardando} className="w-full">
        {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear bolsillo'}
      </Boton>
    </form>
  )
}

/** Nombre en español del tipo de bolsillo. */
export function etiquetaDe(tipo: TipoCuenta): string {
  return TIPOS.find((t) => t.tipo === tipo)?.etiqueta ?? tipo
}

/** Icono del tipo de bolsillo, para la lista. */
export function iconoDe(tipo: TipoCuenta): Icon {
  return TIPOS.find((t) => t.tipo === tipo)?.Icono ?? MoneyIcon
}
