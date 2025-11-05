import React, {useState} from 'react'
import { createApi } from '../api'

export default function Register({goLogin}){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  async function submit(e){
    e.preventDefault()
    try{
      const api = createApi()
      await api.post('/auth/register',{username,password})
      setMsg('Account created. You can now login.')
    }catch(err){
      setMsg(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create an account</h2>
      {msg && <div className="text-green-600 mb-2">{msg}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Choose username" className="w-full p-2 border rounded" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Choose password" className="w-full p-2 border rounded" />
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Register</button>
          <button type="button" onClick={goLogin} className="px-4 py-2 rounded border">Back to login</button>
        </div>
      </form>
    </div>
  )
}
