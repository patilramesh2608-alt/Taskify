import React, {useState} from 'react'

export default function TaskForm({onAdd, isSubmitting = false}){
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('Personal')

  const handleSubmit = async e => {
    e.preventDefault()
    if(!title.trim() || isSubmitting) {
      return
    }
    if (!onAdd || typeof onAdd !== 'function') {
      console.error('onAdd is not a function')
      return
    }
    try {
      await onAdd({ 
        title: title.trim(), 
        priority, 
        due_date: dueDate || null, 
        category 
      })
      // Clear form on success
      setTitle('')
      setDueDate('')
      setPriority('medium')
      setCategory('Personal')
    } catch (err) {
      // Error is already handled in Dashboard
      console.error('Failed to add task:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add new task..." className="p-2 border rounded col-span-2" />
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="p-2 border rounded">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="p-2 border rounded" />
        <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (Work, Personal)" className="p-2 border rounded col-span-2" />
      </div>
      <div>
        <button type="submit" disabled={isSubmitting || !title.trim()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}
