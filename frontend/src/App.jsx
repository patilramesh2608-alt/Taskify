import React, {useEffect, useState} from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

export default function App(){
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('taskify_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [view, setView] = useState('dashboard')

  useEffect(()=>{ 
    if(!user) {
      setView('login')
    } else {
      setView('dashboard')
    }
  }, [user])

  function handleLogin(user){
    if(user && user.username) {
      localStorage.setItem('taskify_user', JSON.stringify(user))
      setUser(user)
    }
  }
  
  function handleLogout(){ 
    localStorage.removeItem('taskify_user')
    setUser(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-5xl">
        {!user && view==='login' && <Login onLogin={handleLogin} goRegister={()=>setView('register')} />}
        {!user && view==='register' && <Register goLogin={()=>setView('login')} />}
        {user && <Dashboard username={user.username} onLogout={handleLogout} user={user} />}
      </div>
    </div>
  )
}
