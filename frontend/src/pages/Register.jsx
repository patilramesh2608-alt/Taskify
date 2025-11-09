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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create an account</h2>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded">{error}</div>}
      {msg && <div className="text-green-600 mb-2 p-2 bg-green-50 rounded">{msg}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input 
          value={username} 
          onChange={e=>{
            setUsername(e.target.value)
            setError('')
          }} 
          placeholder="Choose username" 
          className="w-full p-2 border rounded" 
          required
          minLength={3}
        />
        <input 
          type="password" 
          value={password} 
          onChange={e=>{
            setPassword(e.target.value)
            setError('')
          }} 
          placeholder="Choose password (min 6 characters)" 
          className="w-full p-2 border rounded" 
          required
          minLength={6}
        />
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Register</button>
          <button type="button" onClick={goLogin} className="px-4 py-2 rounded border">Back to login</button>
        </div>
      </form>
    </div>
  )
}
