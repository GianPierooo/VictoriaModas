import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { evaluarContrasena } from '../lib/authValidation.js'

const inputClass = (hasError) =>
  `w-full border-b bg-transparent py-2.5 pr-9 text-ink font-light placeholder:text-ink-muted/50 focus:outline-none transition-colors ${
    hasError ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
  }`
const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'

const COLOR_PUNTAJE = ['bg-red-300', 'bg-amber-400', 'bg-clay', 'bg-emerald-500']

// Campo de contraseña con ojito para mostrar/ocultar — reutilizado en
// login, registro y restablecer contraseña. `mostrarFuerza` activa el
// medidor visual (solo tiene sentido al crear/cambiar contraseña, no al
// iniciar sesión con una que ya existe).
export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  hasError = false,
  mostrarFuerza = false,
}) {
  const [visible, setVisible] = useState(false)
  const fuerza = mostrarFuerza ? evaluarContrasena(value) : null

  return (
    <div>
      {label && (
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          id={id}
          name={name}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass(hasError)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink-muted transition-colors hover:text-ink cursor-pointer"
        >
          {visible ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>

      {mostrarFuerza && value && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i < fuerza.puntaje ? COLOR_PUNTAJE[fuerza.puntaje] : 'bg-ink/10'
                }`}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[11px] font-light text-ink-muted">
            {fuerza.etiqueta}
            {!fuerza.valida && ' — mínimo 8 caracteres, con letras y números'}
          </p>
        </div>
      )}
    </div>
  )
}
