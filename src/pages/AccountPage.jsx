import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardIcon, CheckIcon, ShareIcon } from '@heroicons/react/24/outline'
import Layout from '../components/Layout.jsx'
import PhoneField from '../components/PhoneField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import GoogleSignInButton from '../components/GoogleSignInButton.jsx'
import Turnstile from '../components/Turnstile.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { DEFAULT_PHONE_COUNTRY, PHONE_COUNTRIES } from '../utils/phoneCountries.js'
import { listVentasCliente } from '../lib/supabaseAdmin.js'
import { obtenerOCrearCodigoReferido, listarRecompensasReferidos, VALOR_REFERIDO_SOLES } from '../lib/referidos.js'
import { formatPEN } from '../utils/price.js'
import { esEmailValido, evaluarContrasena } from '../lib/authValidation.js'
import { mapAuthError } from '../lib/authErrors.js'

// "+51 999888777" → { prefix: '+51', numero: '999888777' } (tolerante a
// teléfonos guardados sin prefijo, de antes de que existiera este campo).
function parseTelefono(telefono) {
  const raw = (telefono || '').trim()
  if (!raw) return { prefix: DEFAULT_PHONE_COUNTRY.code, numero: '' }
  const [first, ...rest] = raw.split(' ')
  const conocido = PHONE_COUNTRIES.find((c) => c.code === first)
  if (conocido) return { prefix: conocido.code, numero: rest.join(' ') }
  return { prefix: DEFAULT_PHONE_COUNTRY.code, numero: raw }
}

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const inputClass = (hasError) =>
  `w-full border-b bg-transparent py-2.5 text-ink font-light placeholder:text-ink-muted/50 focus:outline-none transition-colors ${
    hasError ? 'border-red-300 focus:border-red-400' : 'border-ink/20 focus:border-clay'
  }`
const labelClass = 'mb-2 block text-[10px] uppercase tracking-luxe text-ink-muted'

// Separador "o" entre el acceso con Google y el formulario de siempre.
function SeparadorO() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-ink/10" />
      <span className="text-[10px] uppercase tracking-luxe text-ink-muted">o</span>
      <span className="h-px flex-1 bg-ink/10" />
    </div>
  )
}

export default function AccountPage() {
  useDocumentMeta({
    title: 'Mi cuenta | Victoria Modas',
    description: 'Inicia sesión o crea tu cuenta en Victoria Modas para seguir tus pedidos.',
  })

  const { user, profile, loading, isAuthConfigured, signOut } = useAuth()

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center bg-cream">
          <p className="text-sm font-light uppercase tracking-luxe text-ink-muted">Cargando…</p>
        </div>
      </Layout>
    )
  }

  const loggedIn = isAuthConfigured && user

  return (
    <Layout>
      <div className="bg-cream">
        <div
          className={`mx-auto flex min-h-[70vh] flex-col px-6 py-20 lg:px-8 ${
            loggedIn ? 'max-w-3xl' : 'max-w-xl items-center justify-center'
          }`}
        >
          {!isAuthConfigured ? (
            <NoAuthNotice />
          ) : user ? (
            <LoggedInPanel user={user} profile={profile} onLogout={signOut} />
          ) : (
            <AuthForms />
          )}
        </div>
      </div>
    </Layout>
  )
}

function NoAuthNotice() {
  return (
    <div className="text-center">
      <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Próximamente</p>
      <h1 className="mb-6 font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">
        Tu cuenta, <span className="italic text-clay">muy pronto</span>
      </h1>
      <p className="mb-10 max-w-md font-light leading-relaxed text-ink-soft">
        Estamos terminando de conectar el sistema de cuentas. Mientras tanto, coordinamos todo por WhatsApp.
      </p>
      <Link
        to="/vestidos"
        className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
      >
        Seguir comprando
      </Link>
    </div>
  )
}

function LoggedInPanel({ user, profile, onLogout }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [tab, setTab] = useState('perfil') // 'perfil' | 'pedidos' | 'referidos'

  const handleLogout = async () => {
    await onLogout()
    toast.success('Sesión cerrada.')
    navigate('/')
  }

  // Cuenta creada con Google (o alguna vieja de antes) sin nombre/teléfono
  // — se pide completarlo antes de dejar ver el resto de "Mi cuenta". El
  // registro normal ya pide ambos datos al crear la cuenta; este gate
  // atrapa el hueco de Google (que solo trae el correo).
  const perfilIncompleto = !profile?.nombre?.trim() || !profile?.telefono?.trim()

  if (perfilIncompleto) {
    return (
      <div className="w-full">
        <div className="mb-10 text-center">
          <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Mi cuenta</p>
          <h1 className="mb-3 font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">¡Ya casi!</h1>
          <p className="font-light text-ink-soft">{user.email}</p>
        </div>
        <CompleteProfileGate profile={profile} />
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleLogout}
            className="text-[11px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Mi cuenta</p>
        <h1 className="mb-3 font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">
          Hola{profile?.nombre ? `, ${profile.nombre.split(' ')[0]}` : ''}
        </h1>
        <p className="font-light text-ink-soft">{user.email}</p>
      </div>

      <div className="mx-auto mb-9 flex max-w-sm gap-2 rounded-full bg-cream-dark p-1">
        {[
          { key: 'perfil', label: 'Mi perfil' },
          { key: 'pedidos', label: 'Mis pedidos' },
          { key: 'referidos', label: 'Referidos' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
              tab === t.key ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'perfil' && <ProfileTab user={user} profile={profile} />}
      {tab === 'pedidos' && <OrdersTab userId={user.id} />}
      {tab === 'referidos' && <ReferidosTab userId={user.id} nombre={profile?.nombre} />}

      <div className="mt-10 flex flex-col items-center gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:justify-center">
        <Link
          to="/vestidos"
          className="inline-flex items-center justify-center rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
        >
          Seguir comprando
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-full border border-ink/20 px-9 py-4 text-xs uppercase tracking-[0.2em] text-ink transition-colors duration-500 hover:border-ink hover:bg-ink/[0.03]"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function CompleteProfileGate({ profile }) {
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
    // Al guardar, updateProfile() actualiza el `profile` del contexto — este
    // componente desaparece solo (LoggedInPanel deja de considerarlo
    // incompleto) sin necesidad de un callback aparte.
    const { error } = await updateProfile({ nombre: nombre.trim(), telefono })
    setGuardando(false)
    if (error) {
      toast.error('No se pudo guardar: ' + error.message)
      return
    }
    toast.success('¡Listo! Ya tienes tu cuenta completa.')
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto max-w-sm space-y-7 rounded-2xl bg-white p-6 text-left shadow-soft ring-1 ring-ink/10 sm:p-8"
    >
      <p className="font-light leading-relaxed text-ink-soft">
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

function ProfileTab({ user, profile }) {
  const { updateProfile } = useAuth()
  const toast = useToast()
  const parsed = parseTelefono(profile?.telefono)
  const [nombre, setNombre] = useState(profile?.nombre || '')
  const [telefonoPrefix, setTelefonoPrefix] = useState(parsed.prefix)
  const [telefonoNumero, setTelefonoNumero] = useState(parsed.numero)
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) {
      toast.error('Ingresa tu nombre.')
      return
    }
    const telefono = telefonoNumero.trim() ? `${telefonoPrefix} ${telefonoNumero.trim()}` : ''
    setGuardando(true)
    const { error } = await updateProfile({ nombre: nombre.trim(), telefono })
    setGuardando(false)
    if (error) {
      toast.error('No se pudo guardar: ' + error.message)
      return
    }
    toast.success('Datos actualizados.')
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-7 rounded-2xl bg-white p-6 text-left shadow-soft ring-1 ring-ink/10 sm:p-8">
      <div>
        <label className={labelClass}>Correo electrónico</label>
        <p className="border-b border-transparent py-2.5 font-light text-ink-muted">{user.email}</p>
      </div>
      <div>
        <label htmlFor="perfil-nombre" className={labelClass}>Nombre completo</label>
        <input
          type="text"
          id="perfil-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={inputClass(false)}
        />
      </div>
      <PhoneField
        id="perfil-telefono"
        label="Teléfono"
        prefix={telefonoPrefix}
        onPrefixChange={setTelefonoPrefix}
        number={telefonoNumero}
        onNumberChange={setTelefonoNumero}
      />
      <button
        type="submit"
        disabled={guardando}
        className="w-full rounded-full bg-ink px-9 py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60"
      >
        {guardando ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function OrdersTab({ userId }) {
  const toast = useToast()
  const [ventas, setVentas] = useState(null)

  useEffect(() => {
    listVentasCliente(userId)
      .then(setVentas)
      .catch((err) => {
        toast.error('No se pudo cargar tu historial: ' + err.message)
        setVentas([])
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  if (ventas === null) {
    return <p className="text-center text-sm text-ink-muted">Cargando…</p>
  }

  if (ventas.length === 0) {
    return (
      <div className="mx-auto max-w-sm rounded-2xl bg-white p-6 text-center shadow-soft ring-1 ring-ink/10 sm:p-8">
        <p className="mb-1 text-[10px] uppercase tracking-luxe text-ink-muted">Pedidos</p>
        <p className="font-light text-ink-soft">
          Aún no tienes pedidos en tu cuenta. Los pedidos por WhatsApp se coordinan aparte; cuando
          termines una compra desde la web, va a aparecer aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 text-left">
      {ventas.map((v) => (
        <div key={v.id} className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-ink/10">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs uppercase tracking-luxe text-ink-muted">
              {new Date(v.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <span className="rounded-full bg-clay/10 px-3 py-1 text-[10px] uppercase tracking-wide text-clay">
              {ESTADO_LABEL[v.estado] || v.estado}
            </span>
          </div>
          <p className="font-light text-ink-soft">{v.venta_items?.length || 0} artículo(s)</p>
          <p className="font-serif text-lg font-light text-ink">{formatPEN(v.total) || `S/ ${v.total}`}</p>
        </div>
      ))}
    </div>
  )
}

function ReferidosTab({ userId, nombre }) {
  const toast = useToast()
  const [codigo, setCodigo] = useState(null) // null = cargando, '' nunca ocurre (siempre hay algo o error)
  const [recompensas, setRecompensas] = useState(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    let alive = true
    obtenerOCrearCodigoReferido(userId, nombre)
      .then((c) => alive && setCodigo(c))
      .catch((err) => {
        if (!alive) return
        toast.error('No se pudo generar tu código: ' + err.message)
        setCodigo(false) // false = error, distinto de null (cargando)
      })
    listarRecompensasReferidos(userId)
      .then((r) => alive && setRecompensas(r))
      .catch(() => alive && setRecompensas([]))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const copiarCodigo = async () => {
    if (!codigo) return
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      toast.success('Código copiado.')
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('No se pudo copiar — anótalo: ' + codigo)
    }
  }

  const compartirWhatsApp = () => {
    if (!codigo) return
    const mensaje =
      `¡Hola! Te comparto mi código de Victoria Modas: *${codigo}* — ` +
      `úsalo en tu primera compra y ganas S/ ${VALOR_REFERIDO_SOLES} de descuento. ` +
      `victoriamodas.store`
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 text-left">
      <div className="rounded-2xl bg-white p-6 shadow-soft ring-1 ring-ink/10 sm:p-8">
        <p className="mb-1 text-[10px] uppercase tracking-luxe text-ink-muted">Invita y gana</p>
        <p className="mb-6 font-light leading-relaxed text-ink-soft">
          Comparte tu código con una amiga: ella gana S/ {VALOR_REFERIDO_SOLES} en su primera compra,
          y tú ganas otros S/ {VALOR_REFERIDO_SOLES} cuando la use.
        </p>

        {codigo === null && <p className="text-sm text-ink-muted">Generando tu código…</p>}
        {codigo === false && <p className="text-sm text-red-400">No se pudo generar tu código. Intenta más tarde.</p>}

        {codigo && (
          <>
            <button
              type="button"
              onClick={copiarCodigo}
              aria-label={`Copiar código ${codigo}`}
              className="mb-4 flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-clay/40 bg-cream px-5 py-4 transition-colors hover:border-clay"
            >
              <span className="font-serif text-lg font-light tracking-[0.08em] text-ink">{codigo}</span>
              <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] text-clay">
                {copiado ? <CheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                {copiado ? 'Copiado' : 'Copiar'}
              </span>
            </button>
            <button
              type="button"
              onClick={compartirWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay"
            >
              <ShareIcon className="h-4 w-4" />
              Compartir por WhatsApp
            </button>
          </>
        )}
      </div>

      <div>
        <p className="mb-3 text-[10px] uppercase tracking-luxe text-ink-muted">Tus recompensas</p>
        {recompensas === null && <p className="text-sm text-ink-muted">Cargando…</p>}
        {recompensas !== null && recompensas.length === 0 && (
          <p className="rounded-2xl bg-white p-5 text-sm font-light text-ink-soft shadow-soft ring-1 ring-ink/10">
            Aún no tienes recompensas — aparecerán aquí cuando una amiga compre con tu código.
          </p>
        )}
        {recompensas !== null && recompensas.length > 0 && (
          <div className="space-y-3">
            {recompensas.map((r) => {
              const usado = r.usos_maximos != null && r.usos_actuales >= r.usos_maximos
              return (
                <div key={r.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-soft ring-1 ring-ink/10">
                  <div>
                    <p className="font-serif text-base font-light text-ink">{r.codigo}</p>
                    <p className="text-xs text-ink-muted">S/ {r.valor} de descuento</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wide ${usado ? 'bg-ink/5 text-ink-muted' : 'bg-clay/10 text-clay'}`}>
                    {usado ? 'Usado' : 'Disponible'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function AuthForms() {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'forgot'

  const titulos = {
    login: <>Bienvenida de <span className="italic text-clay">vuelta</span></>,
    register: <>Crea tu <span className="italic text-clay">cuenta</span></>,
    forgot: <>Recupera tu <span className="italic text-clay">acceso</span></>,
  }

  return (
    <div className="w-full">
      <div className="mb-10 text-center">
        <p className="mb-4 text-[11px] uppercase tracking-luxe text-clay">Mi cuenta</p>
        <h1 className="font-serif text-4xl font-light leading-[1.05] text-ink md:text-5xl">{titulos[mode]}</h1>
      </div>

      {/* Selector login/registro — oculto en el flujo de recuperación */}
      {mode !== 'forgot' && (
        <div className="mb-9 flex justify-center gap-2 rounded-full bg-cream-dark p-1">
          {[
            { key: 'login', label: 'Ingresar' },
            { key: 'register', label: 'Registrarme' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setMode(t.key)}
              className={`flex-1 rounded-full px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors duration-300 ${
                mode === t.key ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {mode === 'login' && <LoginForm onForgotPassword={() => setMode('forgot')} />}
      {mode === 'register' && <RegisterForm onDone={() => setMode('login')} />}
      {mode === 'forgot' && <ForgotPasswordForm onBack={() => setMode('login')} />}
    </div>
  )
}

function LoginForm({ onForgotPassword }) {
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [resetCaptcha, setResetCaptcha] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!esEmailValido(formData.email)) nextErrors.email = true
    if (!formData.password) nextErrors.password = true
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      if (nextErrors.email && formData.email.trim()) toast.error('Ingresa un correo válido.')
      return
    }

    setSubmitting(true)
    const { error } = await signIn({ ...formData, captchaToken })
    setSubmitting(false)
    setResetCaptcha((n) => n + 1) // el token de Turnstile es de un solo uso

    if (error) {
      toast.error(mapAuthError(error))
      return
    }
    toast.success('¡Bienvenida de vuelta!')
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <GoogleSignInButton label="Ingresar con Google" />
      <SeparadorO />
      <div>
        <label htmlFor="email" className={labelClass}>Correo electrónico *</label>
        <input
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tucorreo@ejemplo.com"
          className={inputClass(errors.email)}
        />
      </div>
      <div>
        <PasswordField
          id="password"
          name="password"
          label="Contraseña *"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          hasError={errors.password}
        />
        <button
          type="button"
          onClick={onForgotPassword}
          className="mt-2 text-[11px] uppercase tracking-[0.1em] text-clay underline decoration-clay/40 underline-offset-4 transition-colors hover:text-clay-dark cursor-pointer"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
      <Turnstile onToken={setCaptchaToken} resetToken={resetCaptcha} />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60"
      >
        {submitting ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}

function RegisterForm({ onDone }) {
  const { signUp } = useAuth()
  const toast = useToast()
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' })
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [telefonoPrefix, setTelefonoPrefix] = useState(DEFAULT_PHONE_COUNTRY.code)
  const [telefonoNumero, setTelefonoNumero] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [resetCaptcha, setResetCaptcha] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fuerza = evaluarContrasena(formData.password)
    const nextErrors = {}
    if (!formData.nombre.trim()) nextErrors.nombre = true
    if (!esEmailValido(formData.email)) nextErrors.email = true
    if (!telefonoNumero.trim()) nextErrors.telefono = true
    if (!fuerza.valida) nextErrors.password = true
    if (confirmarPassword !== formData.password) nextErrors.confirmar = true

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      if (nextErrors.email && formData.email.trim() && !nextErrors.nombre) {
        toast.error('Ingresa un correo válido.')
      } else if (nextErrors.telefono && !nextErrors.nombre && !nextErrors.email) {
        toast.error('Ingresa tu teléfono.')
      } else if (nextErrors.password && formData.password) {
        toast.error('La contraseña debe tener 8+ caracteres, con letras y números.')
      } else if (nextErrors.confirmar && !nextErrors.password) {
        toast.error('Las contraseñas no coinciden.')
      }
      return
    }

    const telefono = `${telefonoPrefix} ${telefonoNumero.trim()}`

    setSubmitting(true)
    const { data, error } = await signUp({ ...formData, telefono, captchaToken })
    setSubmitting(false)
    setResetCaptcha((n) => n + 1)

    if (error) {
      toast.error(mapAuthError(error))
      return
    }
    // Con "Confirm email" activado en Supabase, signUp NO devuelve una
    // sesión activa todavía (data.session es null) hasta que la clienta
    // confirme el correo — hay que avisarle eso, no decir "ya puedes
    // ingresar" cuando en realidad su cuenta sigue pendiente.
    if (!data?.session) {
      toast.success('Cuenta creada. Revisa tu correo para confirmarla antes de ingresar.')
    } else {
      toast.success('Cuenta creada. Ya puedes ingresar.')
    }
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <GoogleSignInButton label="Registrarme con Google" />
      <SeparadorO />
      <div>
        <label htmlFor="nombre" className={labelClass}>Nombre completo *</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          autoComplete="name"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Tu nombre y apellido"
          className={inputClass(errors.nombre)}
        />
      </div>
      <PhoneField
        id="telefono"
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
      <div>
        <label htmlFor="reg-email" className={labelClass}>Correo electrónico *</label>
        <input
          type="email"
          id="reg-email"
          name="email"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tucorreo@ejemplo.com"
          className={inputClass(errors.email)}
        />
      </div>
      <PasswordField
        id="reg-password"
        name="password"
        label="Contraseña *"
        value={formData.password}
        onChange={handleChange}
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        hasError={errors.password}
        mostrarFuerza
      />
      <PasswordField
        id="reg-password-confirmar"
        name="confirmarPassword"
        label="Confirma tu contraseña *"
        value={confirmarPassword}
        onChange={(e) => {
          setConfirmarPassword(e.target.value)
          if (errors.confirmar) setErrors((p) => ({ ...p, confirmar: false }))
        }}
        autoComplete="new-password"
        placeholder="Repite la contraseña"
        hasError={errors.confirmar}
      />
      <Turnstile onToken={setCaptchaToken} resetToken={resetCaptcha} />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60"
      >
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}

function ForgotPasswordForm({ onBack }) {
  const { resetPasswordForEmail } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!esEmailValido(email)) {
      setError(true)
      toast.error('Ingresa un correo válido.')
      return
    }
    setSubmitting(true)
    const { error: err } = await resetPasswordForEmail(email, captchaToken)
    setSubmitting(false)

    // Mensaje SIEMPRE igual, exista o no la cuenta — evita que alguien use
    // este formulario para averiguar qué correos ya están registrados.
    // Solo un fallo de transporte real (captcha/rate-limit/red) se avisa
    // distinto, porque ahí sí falló el envío en sí, no la existencia del
    // correo.
    if (err && /captcha|rate limit|failed to fetch|network/i.test(err.message)) {
      toast.error(mapAuthError(err))
      return
    }
    setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="text-center">
        <p className="mb-8 font-light leading-relaxed text-ink-soft">
          Si existe una cuenta con ese correo, te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja
          de entrada (y la carpeta de spam, por si acaso).
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-xs uppercase tracking-[0.15em] text-clay underline decoration-clay/40 underline-offset-4"
        >
          Volver a ingresar
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">
      <p className="text-center font-light leading-relaxed text-ink-soft">
        Escribe tu correo y te mandamos un enlace para crear una contraseña nueva.
      </p>
      <div>
        <label htmlFor="forgot-email" className={labelClass}>Correo electrónico *</label>
        <input
          type="email"
          id="forgot-email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(false)
          }}
          placeholder="tucorreo@ejemplo.com"
          className={inputClass(error)}
        />
      </div>
      <Turnstile onToken={setCaptchaToken} />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ink px-9 py-4 text-xs uppercase tracking-[0.2em] text-cream transition-colors duration-500 hover:bg-clay disabled:opacity-60"
      >
        {submitting ? 'Enviando…' : 'Mandarme el enlace'}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="block w-full text-center text-[11px] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:text-ink cursor-pointer"
      >
        Volver a ingresar
      </button>
    </form>
  )
}
