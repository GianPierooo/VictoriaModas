import { useState } from 'react'
import PhoneField from './PhoneField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { DEFAULT_PHONE_COUNTRY, PHONE_COUNTRIES } from '../utils/phoneCountries.js'

const inputClass = (hasError) =>
  `w-full border-b bg-transparent py-2.5 text-ink font-light placeholder:text-ink-muted/50 focus:outline-none transition-colors ${
    hasError ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
  }`
const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'

// "+51 999888777" → { prefix: '+51', numero: '999888777' } — duplicado a
// propósito de AccountPage.jsx (es un helper de una línea, no vale la pena
// una dependencia cruzada solo por esto).
function parseTelefono(telefono) {
  const raw = (telefono || '').trim()
  if (!raw) return { prefix: DEFAULT_PHONE_COUNTRY.code, numero: '' }
  const [first, ...rest] = raw.split(' ')
  const conocido = PHONE_COUNTRIES.find((c) => c.code === first)
  if (conocido) return { prefix: conocido.code, numero: rest.join(' ') }
  return { prefix: DEFAULT_PHONE_COUNTRY.code, numero: raw }
}

// Formulario de "completa tu perfil" (nombre + teléfono) — usado por
// ProfileCompletionGate (bloqueo global) para el hueco real de Google
// Sign-In, que solo trae el correo y deja estos campos vacíos para
// siempre si nada los pide después.
export default function CompleteProfileForm({ profile }) {
  const { updateProfile } = useAuth()
  const toast = useToast()
  const parsed = parseTelefono(profile?.telefono)
  const [nombre, setNombre] = useState(profile?.nombre || '')
  const [telefonoPrefix, setTelefonoPrefix] = useState(parsed.prefix)
  const [telefonoNumero, setTelefonoNumero] = useState(parsed.numero)
  const [errors, setErrors] = useState({})
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!nombre.trim()) nextErrors.nombre = true
    if (!telefonoNumero.trim()) nextErrors.telefono = true
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    const telefono = `${telefonoPrefix} ${telefonoNumero.trim()}`
    setGuardando(true)
    // updateProfile() actualiza el `profile` del AuthContext -- el gate que
    // envuelve este formulario desaparece solo en cuanto profile.nombre/
    // telefono dejan de estar vacíos, sin necesidad de un callback aparte.
    const { error } = await updateProfile({ nombre: nombre.trim(), telefono })
    setGuardando(false)
    if (error) {
      toast.error('No se pudo guardar: ' + error.message)
      return
    }
    toast.success('¡Listo! Ya tienes tu cuenta completa.')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <p className="text-center font-light leading-relaxed text-ink-soft">
        Nos falta tu nombre y teléfono para poder atenderte bien en tus pedidos.
      </p>
      <div>
        <label htmlFor="cp-nombre" className={labelClass}>Nombre completo *</label>
        <input
          type="text"
          id="cp-nombre"
          autoComplete="name"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            if (errors.nombre) setErrors((p) => ({ ...p, nombre: false }))
          }}
          className={inputClass(errors.nombre)}
        />
      </div>
      <PhoneField
        id="cp-telefono"
        label="Teléfono *"
        prefix={telefonoPrefix}
        onPrefixChange={setTelefonoPrefix}
        number={telefonoNumero}
        onNumberChange={(v) => {
          setTelefonoNumero(v)
          if (errors.telefono) setErrors((p) => ({ ...p, telefono: false }))
        }}
        hasError={errors.telefono}
      />
      <button
        type="submit"
        disabled={guardando}
        className="w-full rounded-full bg-ink px-9 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60"
      >
        {guardando ? 'Guardando…' : 'Continuar'}
      </button>
    </form>
  )
}
