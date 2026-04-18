'use client'

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const variantConfig = {
  primary: {
    bg: 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
    border: 'border-primary/20',
    icon: 'bg-primary text-primary-foreground',
    value: 'text-primary',
  },
  success: {
    bg: 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500 text-white',
    value: 'text-emerald-600',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500 text-white',
    value: 'text-amber-600',
  },
  danger: {
    bg: 'bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent',
    border: 'border-red-500/20',
    icon: 'bg-red-500 text-white',
    value: 'text-red-600',
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent',
    border: 'border-blue-500/20',
    icon: 'bg-blue-500 text-white',
    value: 'text-blue-600',
  },
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'primary' 
}: StatsCardProps) {
  const config = variantConfig[variant]
  
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border p-4',
      'backdrop-blur-sm transition-all duration-300',
      'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5',
      config.bg,
      config.border
    )}>
      {/* Decorative circle */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl" />
      
      <div className="relative flex items-center gap-3">
        <div className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm',
          config.icon
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className={cn('text-2xl font-bold tracking-tight', config.value)}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}
