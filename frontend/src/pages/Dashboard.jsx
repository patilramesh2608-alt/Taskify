import React, {useEffect, useState, useMemo} from 'react'
import { createApi } from '../api'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import ProgressCard from '../components/ProgressCard'

export default function Dashboard({username, onLogout, user}){
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [addingTask, setAddingTask] = useState(false)
  const api = useMemo(() => createApi(username), [username])

  useEffect(()=>{ 
    if (username && api) {
      fetchTasks() 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  async function fetchTasks(){
    setLoading(true)
    try {
      const res = await api.get('/api/tasks')
      setTasks(res.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addTask(payload){
    if (!username) {
      setError('Please log in to add tasks')
      return
    }
    
    setAddingTask(true)
    setError(null)
    try {
      const res = await api.post('/api/tasks', payload)
      if (res.data) {
        setTasks(prev=>[...prev, res.data])
        setError(null)
      }
    } catch (err) {
      let errorMsg = 'Failed to add task'
      if (err.response) {
        errorMsg = err.response.data?.error || `Server error (${err.response.status})`
      } else if (err.request) {
        errorMsg = 'No response from server. Is the backend running?'
      } else {
        errorMsg = err.message || 'Failed to add task'
      }
      setError(errorMsg)
      throw err
    } finally {
      setAddingTask(false)
    }
  }

  async function updateTask(id, patch){
    try {
      await api.put('/api/tasks/'+id, patch)
      setTasks(prev=> prev.map(t=> t.id===id ? {...t, ...patch} : t))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task')
      console.error('Error updating task:', err)
    }
  }

  async function deleteTask(id){
    try {
      await api.delete('/api/tasks/'+id)
      setTasks(prev=> prev.filter(t=> t.id!==id))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task')
      console.error('Error deleting task:', err)
    }
  }

  const total = tasks.length
  const completed = tasks.filter(t=>t.completed).length
  const byPriority = {
    high: tasks.filter(t=>t.priority==='high').length,
    medium: tasks.filter(t=>t.priority==='medium').length,
    low: tasks.filter(t=>t.priority==='low').length
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Taskify</h1>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-600">Signed in as <strong>{user?.username}</strong></div>
          <button onClick={onLogout} className="px-3 py-1 border rounded hover:bg-slate-100 transition">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <ProgressCard title="Total tasks" value={total} />
        <ProgressCard title="Completed" value={completed} />
        <div className="col-span-3 md:col-span-1 bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
          <div className="font-semibold mb-2">By priority</div>
          <div className="flex gap-2">
            <div className="px-3 py-2 rounded bg-red-100">High: {byPriority.high}</div>
            <div className="px-3 py-2 rounded bg-yellow-100">Medium: {byPriority.medium}</div>
            <div className="px-3 py-2 rounded bg-green-100">Low: {byPriority.low}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        <TaskForm onAdd={addTask} isSubmitting={addingTask} />
        {loading ? <div className="p-4">Loading...</div> : <TaskList tasks={tasks} onToggle={t=> updateTask(t.id, {completed: !t.completed})} onDelete={deleteTask} />}
      </div>
    </div>
  )
}
