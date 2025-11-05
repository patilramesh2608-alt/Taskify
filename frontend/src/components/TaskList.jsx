import React from 'react'

export default function TaskList({tasks, onToggle, onDelete}){
  if(!tasks.length) return <p className="text-slate-500">No tasks yet — add one above ✨</p>
  return (
    <div className="mt-4 space-y-2">
      {tasks.map(t=>(
        <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded hover:shadow-md transition">
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={t.completed} onChange={()=>onToggle(t)} className="w-4 h-4" />
            <div>
              <div className="font-semibold">{t.title}</div>
              <div className="text-sm text-slate-500">{t.category ? t.category + ' • ' : ''}{t.due_date ? 'Due: '+t.due_date : ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={"px-2 py-1 rounded text-sm " + (t.priority==='high' ? 'bg-red-100' : t.priority==='medium' ? 'bg-yellow-100' : 'bg-green-100')}>{t.priority}</div>
            <button onClick={()=>onDelete(t.id)} className="text-red-600 hover:underline">Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
