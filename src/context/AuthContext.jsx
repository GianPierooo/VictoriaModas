// ============================================================
// AuthContext — sesión de cliente/vendedor/admin (Supabase Auth)
// ------------------------------------------------------------
// Expone { user, profile, loading, profileLoading, signUp, signIn, signOut,
// updateProfile }.
//
// `profile` viene de la tabla `perfiles` (rol: admin | vendedor | cliente),
// creada automáticamente por un trigger al registrarse — ver el esquema en
// Supabase.
//
// `profileLoading` es DERIVADO en cada render (no es un estado propio):
// true mientras hay sesión pero `profile` todavía no corresponde a ese
// usuario. Se calcula así (en vez de guardarlo en un `useState` aparte,
// actualizado desde el efecto) porque un estado separado siempre deja una
// ventana de un render donde `session` ya cambió pero el flag de carga
// todavía no se puso al día — y un consumidor como RequireRole decidiría
// con datos a medias justo en esa ventana.
//
// Si Supabase no está configurado (faltan las env vars), el contexto sigue
// funcionando en modo "sin sesión": no revienta la web, solo el login/
// registro no hacen nada útil (con aviso claro al usuario).
// ============================================================
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carga la sesión inicial y se suscribe a cambios (login/logout/refresh).
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  // Perfil (rol, nombre, teléfono) — se recarga cuando cambia el usuario.
  useEffect(() => {
    const userId = session?.user?.id
    if (!supabase || !userId) {
      setProfile(null)
      return
    }
    let cancelled = false
    supabase
      .from('perfiles')
      .select('user_id, nombre, telefono, rol')
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('[auth] no se pudo cargar el perfil:', error.message)
          // Sesión "fantasma": el token sigue siendo válido pero el usuario ya
          // no existe (o su perfil se perdió). Cerramos sesión en vez de dejar
          // una cuenta a medias (sin nombre, sin datos, con "Mi cuenta" activo
          // pero nada real detrás).
          supabase.auth.signOut()
          return
        }
        setProfile(data)
      })
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const signUp = async ({ email, password, nombre, telefono }) => {
    if (!supabase) return { error: { message: 'Supabase no está configurado.' } }
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, telefono } }, // → trigger los copia a `perfiles`
    })
  }

  const signIn = async ({ email, password }) => {
    if (!supabase) return { error: { message: 'Supabase no está configurado.' } }
    return supabase.auth.signInWithPassword({ email, password })
  }

  // Entrar con Google. Redirige a Google y vuelve a /mi-cuenta con la sesión
  // ya iniciada (Supabase procesa el retorno solo). Requiere tener el
  // proveedor Google activado en Supabase → Authentication → Providers.
  // Vale la pena además por un motivo de negocio, no solo de comodidad: una
  // cuenta de Google es mucho más difícil de crear en masa que un correo sin
  // verificar, así que los límites de "un cupón por persona" pesan más.
  const signInWithGoogle = async () => {
    if (!supabase) return { error: { message: 'Supabase no está configurado.' } }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/mi-cuenta` },
    })
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  // Edita nombre/teléfono de la propia cuenta (RLS: perfiles_update_propio).
  const updateProfile = async ({ nombre, telefono }) => {
    if (!supabase || !session?.user?.id) return { error: { message: 'No hay sesión.' } }
    const { data, error } = await supabase
      .from('perfiles')
      .update({ nombre, telefono, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id)
      .select('user_id, nombre, telefono, rol')
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }

  const user = session?.user ?? null
  // Derivado, no estado propio (ver el porqué en el comentario de cabecera).
  const profileLoading = Boolean(user) && profile?.user_id !== user?.id

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      profileLoading,
      isAuthConfigured: Boolean(supabase),
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, profile, loading, profileLoading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
