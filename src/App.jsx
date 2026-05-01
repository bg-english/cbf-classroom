import { useEffect, useState } from 'react'
import { supabase } from './utils/supabase'
import LoginPage from './pages/LoginPage'
import ClassroomApp from './pages/ClassroomApp'
import './index.css'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [teacher, setTeacher] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadTeacher(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) loadTeacher(session.user.id)
        else setTeacher(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function loadTeacher(userId) {
    const { data } = await supabase
      .from('teachers')
      .select('*, schools(*)')
      .eq('id', userId)
      .single()

    if (data) setTeacher(data)
  }

  if (session === undefined) {
    return (
      <div className="cc-loading-screen">
        <div className="cc-loading-logo">ETA</div>
        <div className="cc-loading-spinner" />
      </div>
    )
  }

  if (!session || !teacher) {
    return <LoginPage />
  }

  if (teacher.status !== 'approved') {
    return (
      <div className="cc-loading-screen">
        <div className="cc-status-message">
          <h2>Cuenta pendiente de aprobación</h2>
          <p>Contacta al coordinador para activar tu cuenta.</p>
          <button onClick={() => supabase.auth.signOut()}>Salir</button>
        </div>
      </div>
    )
  }

  return <ClassroomApp session={session} teacher={teacher} />
}
