import React, {useState} from 'react'

export default function TaskForm({onAdd, isSubmitting = false}){
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('Personal')
  const [error, setError] = useState('')

  function validateForm() {
    const trimmedTitle = title.trim()
    const trimmedCategory = category.trim()

    if (!trimmedTitle) {
      setError('Task title is required')
      return false
    }

    if (trimmedTitle.length > 200) {
      setError('Task title must be less than 200 characters')
      return false
    }

    if (trimmedCategory && trimmedCategory.length > 50) {
      setError('Category must be less than 50 characters')
      return false
    }

    // Validate due date if provided
    if (dueDate) {
      const selectedDate = new Date(dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (isNaN(selectedDate.getTime())) {
        setError('Invalid due date')
        return false
      }
    }

    setError('')
    return true
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!validateForm() || isSubmitting) {
      return
    }

    if (!onAdd || typeof onAdd !== 'function') {
      setError('Form submission error. Please refresh the page.')
      console.error('onAdd is not a function')
      return
    }

    try {
      await onAdd({ 
        title: title.trim(), 
        priority, 
        due_date: dueDate || null, 
        category: category.trim() || 'Personal'
      })
      // Clear form on success
      setTitle('')
      setDueDate('')
      setPriority('medium')
      setCategory('Personal')
      setError('')
    } catch (err) {
      // Error is already handled in Dashboard, but we can show a message here too
      setError(err.response?.data?.error || 'Failed to add task. Please try again.')
      console.error('Failed to add task:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-red-600 p-2 bg-red-50 rounded text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input 
          value={title} 
          onChange={e=>{
            setTitle(e.target.value)
            setError('')
          }} 
          placeholder="Add new task..." 
          className="p-2 border rounded col-span-2" 
          required
          maxLength={200}
        />
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="p-2 border rounded">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input 
          type="date" 
          value={dueDate} 
          onChange={e=>{
            setDueDate(e.target.value)
            setError('')
          }} 
          className="p-2 border rounded" 
        />
        <input 
          value={category} 
          onChange={e=>{
            setCategory(e.target.value)
            setError('')
          }} 
          placeholder="Category (Work, Personal)" 
          className="p-2 border rounded col-span-2" 
          maxLength={50}
        />
      </div>
      <div>
        <button 
          type="submit" 
          disabled={isSubmitting || !title.trim()} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </div>
    </form>
  )
}
