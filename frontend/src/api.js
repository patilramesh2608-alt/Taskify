import axios from 'axios'

export function createApi(username){
  const api = axios.create({ 
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  // Set username in header for authentication
  if(username) {
    const cleanUsername = String(username).trim()
    if(cleanUsername) {
      api.defaults.headers.common['X-Username'] = cleanUsername
    }
  }
  
  return api
}
