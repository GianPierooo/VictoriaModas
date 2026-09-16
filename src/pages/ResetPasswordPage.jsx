// ============================================================
// ResetPasswordPage — "/restablecer-contrasena"
// ------------------------------------------------------------
// A donde llega la clienta al hacer click en el enlace del correo de
// "olvidé mi contraseña" (ver AuthContext#resetPasswordForEmail). Supabase
// procesa el enlace SOLO (deja una sesión de recuperación activa) antes de
// que este componente monte — acá solo queda pedir la nueva contraseña.
//
// Si alguien llega aquí SIN pasar por el enlace (sin sesión de
// recuperación), `updateUser` falla con un error claro que se traduce
// igual que el resto (ver authErrors.js) — no hay nada que romper.
// ============================================================
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import PasswordField from '../components/PasswordField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { evaluarContrasena } from '../lib/authValidation.js'
import { mapAuthError } from '../lib/authErrors.js'

export default function ResetPasswordPage() {
  useDocumentMeta({ title: 'Restablecer contraseña | Victoria Modas' })
  const { updatePassword, isAuthConfigured } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [listo, setListo] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fuerza = evaluarContrasena(password)
    const nextErrors = {}
    if (!fuerza.valida) nextErrors.password = true
    if (confirmar !== password) nextErrors.confirmar = true
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      if (nextErrors.confirmar) toast.error('Las contraseñas no coinciden.')
      else toast.error('La contraseña debe tener 8+ caracteres, con letras y números.')
      return
    }

    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)

    if (error) {
      toast.error(mapAuthError(error))
      return
    }
    setListo(true)
    toast.success('Contraseña actualizada.')
    setTimeout(() => navigate('/mi-cuenta'), 1800)
  }

  return (
    <Layout>
      <div className="bg-cream">
        <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 py-20 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Mi cuenta</p>
            <h1 className="font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">
              Nueva <span className="italic text-clay">contraseña</span>
            </h1>
          </div>

          {!isAuthConfigured ? (
            <p className="text-center font-light text-ink-soft">Esta función todavía no está disponible.</p>
          ) : listo ? (
            <div className="text-center">
              <p className="mb-6 font-light text-ink-soft">Tu contraseña se actualizó. Redirigiéndote…</p>
              <Link to="/mi-cuenta" className="text-xs uppercase tracking-[0.15em] text-clay underline">
                Ir a mi cuenta
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="w-full space-y-7">
              <PasswordField
                id="nueva-password"
                name="password"
                label="Nueva contraseña *"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((p) => ({ ...p, password: false }))
                }}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                hasError={errors.password}
                mostrarFuerza
              />
              <PasswordField
                id="confirmar-password"
                name="confirmar"
                label="Confirma tu contraseña *"
                value={confirmar}
                onChange={(e) => {
                  setConfirmar(e.target.value)
                  if (errors.confirmar) setErrors((p) => ({ ...p, confirmar: false }))
                }}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                hasError={errors.confirmar}
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60"
              >
                {submitting ? 'Guardando…' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  )
}
