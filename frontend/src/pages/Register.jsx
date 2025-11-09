import React, {useState} from 'react'
import { createApi } from '../api'

export default function Register({goLogin}){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  function validateForm() {
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()

    if (!trimmedUsername) {
      setError('Username is required')
      return false
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters long')
      return false
    }

    if (!trimmedPassword) {
      setError('Password is required')
      return false
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    // Check for valid username (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, and underscores')
      return false
    }

    setError('')
    return true
  }

  async function submit(e){
    e.preventDefault()
    setError('')
    setMsg('')

    if (!validateForm()) {
      return
    }

    try{
      const api = createApi()
      await api.post('/auth/register',{username: username.trim(), password: password.trim()})
      setMsg('Account created. You can now login.')
      // Clear form on success
      setUsername('')
      setPassword('')
    }catch(err){
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100 max-w-md w-full">
      <h2 className="text-3xl font-bold mb-6 text-slate-800">Create an account</h2>
      {error && <div className="text-red-700 mb-4 p-3 bg-red-50 rounded-lg border border-red-200 text-sm">{error}</div>}
      {msg && <div className="text-green-700 mb-4 p-3 bg-green-50 rounded-lg border border-green-200 text-sm">{msg}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <input 
            value={username} 
            onChange={e=>{
              setUsername(e.target.value)
              setError('')
            }} 
            placeholder="Choose username" 
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder:text-slate-400" 
            required
            minLength={3}
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
            placeholder="Choose password (min 6 characters)" 
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 placeholder:text-slate-400" 
            required
            minLength={6}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button 
            type="submit"
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 hover:shadow-md active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Register
          </button>
          <button 
            type="button" 
            onClick={goLogin} 
            className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Back to login
          </button>
        </div>
      </form>
    </div>
  )
}
