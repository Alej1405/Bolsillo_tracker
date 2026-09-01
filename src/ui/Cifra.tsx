import { conSimbolo } from '@/utils/moneda'

/**
 * Una cifra con su etiqueta: el bloque de "Entró", "Salió" o "Lo que tienes".
 *
 * Vive aquí y no en cada pantalla porque lo usan Reportes y Rendimiento, y las
 * dos lo dibujaban igual con dos copias distintas del mismo código.
 *
 * `tono` colorea el número cuando la cifra tiene signo por naturaleza —lo que
 * entra en verde, lo que sale en rojo— y `ayuda` añade una línea explicando
 * qué se está sumando. Las dos son opcionales: sin ninguna queda la cifra sola,
 * que es como la muestra Reportes.
 */
export function Cifra({
  etiqueta,
  monto,
  valor,
  tono = 'neutro',
  ayuda,
}: {
  etiqueta: string
  /** Dinero como llega del backend: "1248.50". Lo formatea `utils/moneda`. */
  monto?: string
  /*
    Un valor que NO es dinero y se muestra tal cual: un número de cuentas, una
    cantidad de días. Existe porque el bloque se ve igual pero no todo lo que
    se cuenta lleva el símbolo del dólar, y pasarle 11 por `monto` mostraba
    "$ 11,00".
  */
  valor?: string
  tono?: 'ingreso' | 'gasto' | 'neutro'
  ayuda?: string
}) {
  const color =
    tono === 'ingreso' ? 'text-ingreso' : tono === 'gasto' ? 'text-gasto' : 'text-texto-principal'

  return (
    <div className="flex flex-col gap-1 rounded-extra bg-fondo-superficie p-5">
      <p className="text-micro tracking-[0.08em] text-texto-tenue uppercase">{etiqueta}</p>
      <p className={`font-cuerpo text-titulo-menor font-bold tabular-nums ${color}`}>
        {valor ?? conSimbolo(monto)}
      </p>
      {ayuda && <p className="text-nota text-texto-tenue">{ayuda}</p>}
    </div>
  )
}
