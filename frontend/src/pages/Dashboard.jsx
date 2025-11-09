// ...existing code...
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
  const [showForm, setShowForm] = useState(false)
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
        setShowForm(false) // collapse form after successful add
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

  // small inline icons for buttons (keeps file self-contained)
  const PlusIcon = ({className="w-4 h-4"} ) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  const LogoutIcon = ({className="w-4 h-4"} ) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500">
            Taskify
          </h1>
          {/* removed Beta badge as requested */}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 pr-2">
            <span className="hidden sm:inline text-sm text-slate-600">Signed in as</span>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-sm text-slate-700 font-medium hidden sm:block">{user?.username}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(s => !s)}
              aria-expanded={showForm}
              aria-controls="task-form"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-xl active:scale-95 transition transform hover:-translate-y-0.5"
              title={showForm ? "Hide new task form" : "Add new task"}
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{showForm ? 'Close' : 'Add Task'}</span>
              {addingTask && <svg className="w-4 h-4 animate-spin ml-1" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25"/></svg>}
            </button>

            
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm hover:shadow-md"
              aria-label="Logout"
              title="Logout"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* colorful summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl p-5 shadow-md transform transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-blue-800">Total tasks</div>
              <div className="mt-2 text-3xl font-bold text-blue-900">{total}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/70 text-blue-800 shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-700/80">Summary of all tasks</div>
        </div>

        <div className="col-span-1 rounded-xl p-5 shadow-md transform transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-orange-800">Completed</div>
              <div className="mt-2 text-3xl font-bold text-orange-900">{completed}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/70 text-orange-800 shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div className="mt-3 text-xs text-orange-700/80">Tasks completed so far</div>
        </div>

        <div className="col-span-1 rounded-xl p-5 shadow-md transform transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-100">
          <div className="font-semibold mb-3 text-emerald-800">By priority</div>
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-2 rounded-lg bg-red-100 text-red-800 text-sm font-medium">High: {byPriority.high}</div>
            <div className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-medium">Medium: {byPriority.medium}</div>
            <div className="px-3 py-2 rounded-lg bg-green-100 text-green-800 text-sm font-medium">Low: {byPriority.low}</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-white to-slate-50 p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 border border-slate-100">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>}

        <div id="task-form" className={`mb-4 transition-all ${showForm ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {/* keep TaskForm usage but hide/show */}
          <TaskForm onAdd={addTask} isSubmitting={addingTask} />
        </div>

        {!showForm && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">Quick actions</div>
            <div className="text-xs text-slate-500">Tip: Click "Add Task" to create a task</div>
          </div>
        )}

        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading tasks…</div>
        ) : (
          <>
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No tasks yet. <button onClick={() => setShowForm(true)} className="ml-2 text-sky-600 font-medium hover:underline">Create your first task</button>
              </div>
            ) : (
              <TaskList tasks={tasks} onToggle={t=> updateTask(t.id, {completed: !t.completed})} onDelete={deleteTask} />
            )}
          </>
        )}
      </div>
    </div>
  )
}
// ...existing code...