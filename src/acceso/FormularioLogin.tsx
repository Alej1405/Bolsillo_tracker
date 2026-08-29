import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/acceso/Campo'

export function FormularioLogin() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex w-full flex-col gap-5">
      <div className="text-left">
        <h1 className="font-titulo text-titulo-mayor font-bold tracking-[-0.02em] text-texto-principal">
          Entra a tu billetera
        </h1>
        <p className="mt-1 text-cuerpo text-texto-secundario">
          Con el correo y la contraseña que usaste al crear la cuenta.
        </p>
      </div>
      <Campo id="login-correo" etiqueta="Tu correo" tipo="email" placeholder="nombre@correo.com" ayuda="El que usaste al registrarte" />
      <Campo id="login-clave" etiqueta="Tu contraseña" tipo="password" placeholder="Escribe tu clave" ayuda="¿La olvidaste? Te ayudamos" />
      <Boton type="submit" className="w-full">Entrar</Boton>
    </form>
  )
}
