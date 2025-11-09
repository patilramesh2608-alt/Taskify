import React, {useState} from 'react'
import { createApi } from '../api'

export default function Login({onLogin, goRegister}){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function validateForm() {
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    if (!trimmedUsername) {
      setError('Username is required')
      return false
    }

    if (!trimmedPassword) {
      setError('Password is required')
      return false
    }

    setError('')
    return true
  }

  async function submit(e){
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    try{
      const api = createApi()
      const res = await api.post('/auth/login',{username: username.trim(), password: password.trim()})
      if(res.data.user) {
        onLogin(res.data.user)
      } else {
        setError('Login failed: No user data received')
      }
    }catch(err){
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 max-w-md w-full">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">Sign in to Taskify</h2>
      {error && <div className="text-red-700 mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-sm">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <input 
            value={username} 
            onChange={e=>{
              setUsername(e.target.value)
              setError('')
            }} 
            placeholder="Username" 
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400" 
            required
          />
        </div>
        <div>
          <input 
            type="password" 
            value={password} 
            onChange={e=>{
              setPassword(e.target.value)
              setError('')
            }} 
            placeholder="Password" 
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400" 
            required
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button 
            type="submit"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in
          </button>
          <button 
            type="button" 
            onClick={goRegister} 
            className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  )
}
