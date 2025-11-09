import React from 'react'
export default function ProgressCard({title, value}){
  return (
    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-slate-100">
      <div className="text-sm text-slate-500 mb-2">{title}</div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
    </div>
  )
}
