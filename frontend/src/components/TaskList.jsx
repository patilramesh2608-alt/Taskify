import React from 'react'

export default function TaskList({tasks, onToggle, onDelete}){
  if(!tasks.length) return <p className="text-slate-500 text-center py-8">No tasks yet — add one above ✨</p>
  return (
    <div className="mt-6 space-y-3">
      {tasks.map(t=>(
        <div 
          key={t.id} 
          className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
            t.completed 
              ? 'bg-slate-50 border-slate-200 opacity-75' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            <input 
              type="checkbox" 
              checked={t.completed} 
              onChange={()=>onToggle(t)} 
              className="w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" 
            />
            <div className="flex-1">
              <div className={`font-medium ${t.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                {t.title}
              </div>
              <div className="text-sm text-slate-500 mt-1">
                {t.category && <span className="inline-block">{t.category}</span>}
                {t.category && t.due_date && <span className="mx-2">•</span>}
                {t.due_date && <span>Due: {t.due_date}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
              t.priority==='high' 
                ? 'bg-red-100 text-red-800' 
                : t.priority==='medium' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
            }`}>
              {t.priority}
            </div>
            <button 
              onClick={()=>onDelete(t.id)} 
              className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium hover:text-red-700 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
