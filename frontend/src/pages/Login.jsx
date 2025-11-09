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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Sign in to Taskify</h2>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input 
          value={username} 
          onChange={e=>{
            setUsername(e.target.value)
            setError('')
          }} 
          placeholder="Username" 
          className="w-full p-2 border rounded" 
          required
        />
        <input 
          type="password" 
          value={password} 
          onChange={e=>{
            setPassword(e.target.value)
            setError('')
          }} 
          placeholder="Password" 
          className="w-full p-2 border rounded" 
          required
        />
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Sign in</button>
          <button type="button" onClick={goRegister} className="px-4 py-2 rounded border">Register</button>
        </div>
      </form>
    </div>
  )
}
