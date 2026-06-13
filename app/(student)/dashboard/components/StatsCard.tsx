import * as React from "react"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
}

export default function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">{value}</h4>
        {description && <p className="text-xs text-slate-400 font-medium mt-1">{description}</p>}
      </div>
      <div className="p-3 bg-blue-50/60 rounded-xl text-[#1B3FA0] transition-colors hover:bg-blue-50">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  )
}
