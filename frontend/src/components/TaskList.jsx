import React from 'react'

export default function TaskList({tasks, onToggle, onDelete}) {
  if (!tasks || tasks.length === 0) {
    return <p className="text-slate-500 text-center py-8">No tasks yet — add one above ✨</p>
  }

  const formatDate = (raw) => {
    if (!raw) return null
    const d = typeof raw === 'string' || typeof raw === 'number' ? new Date(raw) : raw
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString()
  }

  const priorityStyles = (p) => {
    switch ((p || '').toLowerCase()) {
      case 'high':
        return 'from-red-50 to-rose-50 border-rose-100 text-rose-800'
      case 'medium':
        return 'from-amber-50 to-orange-50 border-amber-100 text-amber-800'
      case 'low':
        return 'from-cyan-50 to-emerald-50 border-emerald-100 text-emerald-800'
      default:
        return 'bg-white border-slate-200 text-slate-800'
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {tasks.map(t => {
        const dueRaw = t.dueDate ?? t.due_date ?? t.due ?? null
        const due = formatDate(dueRaw)
        const completed = !!t.completed
        const pr = t.priority ?? 'none'
        const prCaps = pr ? pr[0].toUpperCase() + pr.slice(1) : 'None'
        const prStyle = priorityStyles(pr)

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200
              ${completed ? 'bg-slate-50 border-slate-200 opacity-80' : `bg-gradient-to-r ${prStyle} border ${prStyle.includes('border-') ? '' : 'border-slate-200'} hover:shadow-md hover:scale-102`}
              `}
            >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={completed}
                onChange={() => onToggle(t)}
                className="w-5 h-5 cursor-pointer rounded border-slate-300 text-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                aria-label={completed ? `Mark ${t.title} as not completed` : `Mark ${t.title} as completed`}
              />
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {t.title}
                </div>
                <div className="text-sm mt-1 text-slate-600 flex items-center gap-2 truncate">
                  {t.category && <span className="inline-block">{t.category}</span>}
                  {t.category && due && <span className="mx-2 text-slate-400">•</span>}
                  {due && <span className="text-slate-500">Due: {due}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium ${pr === 'high' ? 'bg-red-100 text-red-800' : pr === 'medium' ? 'bg-yellow-100 text-yellow-800' : pr === 'low' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}
                aria-hidden="true"
              >
                {prCaps}
              </span>

              <button
                onClick={() => onDelete(t.id)}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-medium hover:text-red-700 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title={`Delete ${t.title}`}
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}