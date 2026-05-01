import { useState } from 'react'
import { supabase } from '../utils/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="cc-login-screen">
      <div className="cc-login-card">
        <div className="cc-login-header">
          <div className="cc-login-logo">ETA</div>
          <h1>Classroom</h1>
          <p>Entorno de Aula Digital · Boston Flex</p>
        </div>

        <form onSubmit={handleLogin} className="cc-login-form">
          <input
            type="email"
            placeholder="Correo institucional"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <div className="cc-login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar al aula'}
          </button>
        </form>

        <p className="cc-login-hint">
          Usa las mismas credenciales del CBF Planner
        </p>
      </div>
    </div>
  )
}
