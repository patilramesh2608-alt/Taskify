// ...existing code...
<<<<<<< HEAD
import React, {useEffect, useState, useMemo, useRef} from 'react'
=======
import React, {useEffect, useState, useMemo} from 'react'
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
import { createApi } from '../api'
import TaskForm from '../components/TaskForm'
import TaskList from '../components/TaskList'
import ProgressCard from '../components/ProgressCard'
// ...existing code...

export default function Dashboard({username, onLogout, user}){
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [addingTask, setAddingTask] = useState(false)
  const [showForm, setShowForm] = useState(false)
<<<<<<< HEAD

  // Dark mode state (persisted)
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch {
      return false
    }
  })

=======
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
  const api = useMemo(() => createApi(username), [username])

  // Toasts state
  const [toasts, setToasts] = useState([])
  const toastsRef = useRef([])
  const addToast = (type, message) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,7)
    const t = { id, type, message }
    toastsRef.current = [...toastsRef.current, t]
    setToasts(toastsRef.current)
    setTimeout(() => {
      toastsRef.current = toastsRef.current.filter(x => x.id !== id)
      setToasts(toastsRef.current)
    }, 3800)
  }

  // small popper on finishing a task
  const [poppedTask, setPoppedTask] = useState(null)

  // apply dark class to html root and persist choice
  useEffect(() => {
    try {
      const root = document.documentElement
      if (darkMode) {
        root.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        root.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    } catch (e) {
      // ignore in non-browser env
    }
  }, [darkMode])

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
      const msg = err.response?.data?.error || 'Failed to load tasks'
      setError(msg)
      addToast('error', msg)
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addTask(payload){
    if (!username) {
      setError('Please log in to add tasks')
      addToast('error','Please log in to add tasks')
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
<<<<<<< HEAD
        addToast('success','Task added ✓')
=======
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
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
      addToast('error', errorMsg)
      throw err
    } finally {
      setAddingTask(false)
    }
  }

  async function updateTask(id, patch){
    try {
      await api.put('/api/tasks/'+id, patch)
      setTasks(prev=> prev.map(t=> t.id===id ? {...t, ...patch} : t))
      // show popper and toasts for completion
      if (patch.completed === true) {
        setPoppedTask(id)
        addToast('success', 'Task completed! 🎉')
        setTimeout(()=> setPoppedTask(null), 1400)
      } else if (patch.completed === false) {
        addToast('info', 'Marked as not completed 😔')
      } else {
        addToast('success', 'Task updated ✓')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update task'
      setError(msg)
      addToast('error', msg)
      console.error('Error updating task:', err)
    }
  }

  async function deleteTask(id){
    try {
      await api.delete('/api/tasks/'+id)
      setTasks(prev=> prev.filter(t=> t.id!==id))
      addToast('success', 'Task deleted')
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete task'
      setError(msg)
      addToast('error', msg)
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
<<<<<<< HEAD

  const SunIcon = ({className="w-4 h-4"}) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
  const MoonIcon = ({className="w-4 h-4"}) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  // helpers for inline task rendering
  const cardBg = (task) => {
    if (task.completed) return 'bg-white/80 border border-slate-100 dark:bg-slate-800 dark:border-slate-700'
    switch ((task.priority || '').toLowerCase()) {
      case 'high': return 'bg-gradient-to-r from-red-50 to-pink-50 border border-pink-100 dark:from-rose-900/30 dark:border-rose-800'
      case 'medium': return 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 dark:from-amber-900/20 dark:border-amber-800'
      case 'low': return 'bg-gradient-to-r from-cyan-50 to-emerald-50 border border-emerald-100 dark:from-emerald-900/20 dark:border-emerald-800'
      default: return 'bg-white border border-slate-100 dark:bg-slate-800 dark:border-slate-700'
    }
  }
  const priorityBadge = (p) => {
    switch ((p || '').toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
  }
  const capital = (s) => (s ? s[0].toUpperCase()+s.slice(1) : '')

  return (
    <div className="space-y-6 relative">
      {/* Toasts (top-right) */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`min-w-[220px] max-w-xs rounded-lg px-4 py-2 shadow-lg text-sm font-medium flex items-center gap-3 transition transform ${
            t.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' :
            t.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
            'bg-sky-50 text-sky-800 border border-sky-100'
          }`}>
            <div className="text-lg">{t.type === 'success' ? '🎉' : t.type === 'error' ? '⚠️' : 'ℹ️'}</div>
            <div className="truncate">{t.message}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-4 rounded-xl shadow-sm dark:from-slate-800 dark:via-slate-900 dark:to-indigo-900">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500">
=======

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500">
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
            Taskify
          </h1>
          {/* removed Beta badge as requested */}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 pr-2">
<<<<<<< HEAD
            <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-300">Signed in as</span>
=======
            <span className="hidden sm:inline text-sm text-slate-600">Signed in as</span>
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-pink-500 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-md">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
<<<<<<< HEAD
              <div className="text-sm text-slate-700 font-medium hidden sm:block dark:text-slate-200">{user?.username}</div>
=======
              <div className="text-sm text-slate-700 font-medium hidden sm:block">{user?.username}</div>
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
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

<<<<<<< HEAD
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(d=>!d)}
              aria-pressed={darkMode}
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center p-2 rounded-md bg-white border border-slate-200 hover:shadow-md transition dark:bg-slate-700 dark:border-slate-600"
            >
              {darkMode ? <SunIcon className="w-4 h-4 text-yellow-400" /> : <MoonIcon className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm hover:shadow-md dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
=======
            
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm hover:shadow-md"
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
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
<<<<<<< HEAD
        <div className="col-span-1 rounded-xl p-5 shadow-md transform transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 dark:from-slate-700 dark:to-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-blue-800 dark:text-slate-200">Total tasks</div>
              <div className="mt-2 text-3xl font-bold text-blue-900 dark:text-slate-100">{total}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/70 text-blue-800 shadow-sm dark:bg-slate-700 dark:text-slate-100">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-700/80 dark:text-slate-300">Summary of all tasks</div>
        </div>

        <div className="col-span-1 rounded-xl p-5 shadow-md transform transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 dark:from-slate-700 dark:to-rose-700 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-orange-800 dark:text-slate-200">Completed</div>
              <div className="mt-2 text-3xl font-bold text-orange-900 dark:text-slate-100">{completed}</div>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/70 text-orange-800 shadow-sm dark:bg-slate-700 dark:text-slate-100">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div className="mt-3 text-xs text-orange-700/80 dark:text-slate-300">Tasks completed so far</div>
        </div>

        <div className="col-span-1 rounded-xl p-5 shadow-md transform transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-100 dark:from-slate-700 dark:to-green-800 dark:border-slate-700">
          <div className="font-semibold mb-3 text-emerald-800 dark:text-slate-200">By priority</div>
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-2 rounded-lg bg-red-100 text-red-800 text-sm font-medium dark:bg-red-900/20 dark:text-red-300">High: {byPriority.high}</div>
            <div className="px-3 py-2 rounded-lg bg-yellow-100 text-yellow-800 text-sm font-medium dark:bg-yellow-900/20 dark:text-yellow-300">Medium: {byPriority.medium}</div>
            <div className="px-3 py-2 rounded-lg bg-green-100 text-green-800 text-sm font-medium dark:bg-green-900/20 dark:text-green-300">Low: {byPriority.low}</div>
=======
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
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="bg-gradient-to-r from-white to-slate-50 p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 border border-slate-100 dark:from-slate-900 dark:to-slate-850 dark:border-slate-700">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm dark:bg-red-900/20 dark:text-red-300">{error}</div>}
=======
      <div className="bg-gradient-to-r from-white to-slate-50 p-6 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 border border-slate-100">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">{error}</div>}
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)

        <div id="task-form" className={`mb-4 transition-all ${showForm ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {/* keep TaskForm usage but hide/show */}
          <TaskForm onAdd={addTask} isSubmitting={addingTask} />
        </div>

        {!showForm && (
          <div className="mb-4 flex items-center justify-between">
<<<<<<< HEAD
            <div className="text-sm text-slate-600 dark:text-slate-300">Quick actions</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tip: Click "Add Task" to create a task</div>
=======
            <div className="text-sm text-slate-600">Quick actions</div>
            <div className="text-xs text-slate-500">Tip: Click "Add Task" to create a task</div>
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
          </div>
        )}

        {loading ? (
<<<<<<< HEAD
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">Loading tasks…</div>
        ) : (
          <>
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                No tasks yet. <button onClick={() => setShowForm(true)} className="ml-2 text-sky-600 font-medium hover:underline dark:text-sky-400">Create your first task</button>
              </div>
            ) : (
              /* inline colorful TaskList so we can show poppers / emojis */
              <div className="grid gap-3">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`relative p-4 rounded-xl shadow-md transform transition-all duration-300 hover:shadow-2xl hover:scale-105 ${cardBg(task)}`}
                  >
                    {/* temporary popper animation */}
                    {poppedTask === task.id && (
                      <div className="absolute -top-3 -right-3 text-2xl animate-bounce transform-gpu">🎉</div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {/* emoji per completion state */}
                          <div className="text-lg">
                            {task.completed ? '✅' : '😔'}
                          </div>
                          <div className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {task.title}
                          </div>
                        </div>

                        {task.description && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{task.description}</div>}
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge(task.priority)}`}>{capital(task.priority)}</span>
                          {task.dueDate && <span className="text-xs text-slate-400 dark:text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => updateTask(task.id, {completed: !task.completed})}
                          className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
                            task.completed ? 'bg-green-600 text-white hover:brightness-90' : 'bg-white border border-slate-200 text-slate-700 hover:shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200'
                          }`}
                          aria-pressed={task.completed}
                          title={task.completed ? 'Mark as not completed' : 'Mark as completed'}
                        >
                          {task.completed ? 'Completed' : 'Mark'}
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-sm text-red-600 hover:underline"
                          title="Delete task"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
=======
          <div className="p-6 text-center text-slate-500">Loading tasks…</div>
        ) : (
          <>
            {tasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No tasks yet. <button onClick={() => setShowForm(true)} className="ml-2 text-sky-600 font-medium hover:underline">Create your first task</button>
              </div>
            ) : (
              <TaskList tasks={tasks} onToggle={t=> updateTask(t.id, {completed: !t.completed})} onDelete={deleteTask} />
>>>>>>> 32afdae (Enhance dashboard UI: add hover gradients to cards and style buttons.)
            )}
          </>
        )}
      </div>
    </div>
  )
}
// ...existing code...