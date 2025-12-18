'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUp, 
  ArrowDown,
  Activity,
  Zap,
  Target,
  Award
} from 'lucide-react'

interface StatItem {
  id: string
  title: string
  value: string | number
  change?: {
    value: number
    period: string
    type: 'positive' | 'negative' | 'neutral'
  }
  trend?: {
    direction: 'up' | 'down' | 'stable'
    data?: number[]
  }
  icon?: React.ReactNode
  color?: 'gold' | 'green' | 'red' | 'blue' | 'purple'
  size?: 'sm' | 'default' | 'lg' | 'xl'
  animated?: boolean
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
  loading?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
  switch (direction) {
    case 'up':
      return <ArrowUp className="size-3" />
    case 'down':
      return <ArrowDown className="size-3" />
    default:
      return <Minus className="size-3" />
  }
}

const getChangeColor = (type: 'positive' | 'negative' | 'neutral') => {
  switch (type) {
    case 'positive':
      return 'text-act-green-400 bg-act-green-500/10 border-act-green-500/20'
    case 'negative':
      return 'text-act-red-400 bg-act-red-500/10 border-act-red-500/20'
    default:
      return 'text-act-dark-400 bg-act-dark-500/10 border-act-dark-500/20'
  }
}

const getIconColor = (color: string) => {
  const colors = {
    gold: 'text-act-gold-400 bg-act-gold-500/10 border-act-gold-500/20',
    green: 'text-act-green-400 bg-act-green-500/10 border-act-green-500/20',
    red: 'text-act-red-400 bg-act-red-500/10 border-act-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  }
  return colors[color as keyof typeof colors] || colors.gold
}

export function StatsGrid({ 
  stats, 
  columns = 4, 
  className, 
  loading = false,
  variant = 'default' 
}: StatsGridProps) {
  if (loading) {
    return (
      <div className={cn(
        "grid gap-6",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        className
      )}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="enhanced-card h-32 animate-pulse">
            <div className="h-4 bg-act-dark-700 rounded w-3/4 mb-2" />
            <div className="h-8 bg-act-dark-700 rounded w-1/2 mb-2" />
            <div className="h-3 bg-act-dark-700 rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn(
      "grid gap-6",
      columns === 2 && "grid-cols-1 md:grid-cols-2",
      columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {stats.map((stat, index) => (
        <EnhancedStatCard 
          key={stat.id} 
          stat={stat} 
          variant={variant}
          delay={index * 100}
        />
      ))}
    </div>
  )
}

interface EnhancedStatCardProps {
  stat: StatItem
  variant?: 'default' | 'compact' | 'detailed'
  delay?: number
}

function EnhancedStatCard({ stat, variant = 'default', delay = 0 }: EnhancedStatCardProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const cardRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [delay])

  const sizeClasses = {
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
    xl: "p-10"
  }

  const valueSizeClasses = {
    sm: "text-xl",
    default: "text-3xl",
    lg: "text-4xl",
    xl: "text-5xl"
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "enhanced-card enhanced-stats-card group",
        isVisible && "animate-fade-in-up",
        sizeClasses[stat.size || 'default'],
        variant === 'compact' && "text-center"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-act-dark-400 uppercase tracking-wide">
            {stat.title}
          </p>
          
          <div className={cn(
            "font-bold text-act-gold-400 font-mono",
            valueSizeClasses[stat.size || 'default']
          )}>
            {stat.animated && isVisible ? (
              <AnimatedCounter 
                end={typeof stat.value === 'string' ? parseFloat(stat.value) || 0 : Number(stat.value)} 
                duration={1000} 
                suffix={typeof stat.value === 'string' ? stat.value.replace(/[\d.,]/g, '') : ''}
              />
            ) : (
              stat.value
            )}
          </div>

          {stat.change && (
            <div className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border",
              getChangeColor(stat.change.type)
            )}>
              {getTrendIcon(stat.change.type === 'positive' ? 'up' : stat.change.type === 'negative' ? 'down' : 'stable')}
              {Math.abs(stat.change.value)}%
              <span className="text-act-dark-400 ml-1">{stat.change.period}</span>
            </div>
          )}

          {stat.trend && variant === 'detailed' && (
            <div className="mt-3">
              <MiniChart data={stat.trend.data || [0, 0, 0]} />
            </div>
          )}
        </div>

        {stat.icon && (
          <div className={cn(
            "p-3 rounded-xl border transition-all duration-300 group-hover:scale-110",
            getIconColor(stat.color || 'gold')
          )}>
            {stat.icon}
          </div>
        )}
      </div>
    </div>
  )
}

// Animated counter component
interface AnimatedCounterProps {
  end: number
  duration?: number
  start?: number
  suffix?: string
  prefix?: string
}

function AnimatedCounter({ end, duration = 2000, start = 0, suffix = '', prefix = '' }: AnimatedCounterProps) {
  const [count, setCount] = React.useState(start)
  const [hasAnimated, setHasAnimated] = React.useState(false)

  React.useEffect(() => {
    if (hasAnimated) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(start + (end - start) * easeOutQuart))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setHasAnimated(true)
      }
    }
    
    requestAnimationFrame(animate)
  }, [end, duration, start, hasAnimated])

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>
}

// Mini chart component for trend visualization
interface MiniChartProps {
  data: number[]
  color?: string
  className?: string
}

function MiniChart({ data, color = '#f59e0b', className }: MiniChartProps) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((value - min) / range) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <svg 
      className={cn("w-full h-8", className)} 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <polygon
        fill={`url(#gradient-${color.replace('#', '')})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  )
}

// Predefined stat configurations
export const statConfigs = {
  // Financial stats
  totalVolume: {
    title: 'Total Volume',
    icon: <TrendingUp className="size-5" />,
    color: 'gold' as const,
    animated: true,
  },
  activeUsers: {
    title: 'Active Users',
    icon: <Activity className="size-5" />,
    color: 'green' as const,
    animated: true,
  },
  transactions: {
    title: 'Transactions',
    icon: <Zap className="size-5" />,
    color: 'blue' as const,
    animated: true,
  },
  successRate: {
    title: 'Success Rate',
    icon: <Target className="size-5" />,
    color: 'purple' as const,
    animated: false,
  },
  
  // System stats
  responseTime: {
    title: 'Response Time',
    icon: <Activity className="size-5" />,
    color: 'blue' as const,
    animated: false,
  },
  uptime: {
    title: 'Uptime',
    icon: <Award className="size-5" />,
    color: 'green' as const,
    animated: false,
  },
}

export { StatsGrid, EnhancedStatCard, AnimatedCounter, MiniChart }
export type { StatItem, StatsGridProps }