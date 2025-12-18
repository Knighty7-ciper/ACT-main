'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, TrendingUp, Wallet, Users, DollarSign } from 'lucide-react'

// Loading spinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg' | 'xl'
  color?: 'gold' | 'green' | 'red' | 'blue' | 'white'
  className?: string
}

const sizeClasses = {
  sm: 'size-4',
  default: 'size-6',
  lg: 'size-8',
  xl: 'size-12'
}

const colorClasses = {
  gold: 'text-act-gold-400',
  green: 'text-act-green-400',
  red: 'text-act-red-400',
  blue: 'text-blue-400',
  white: 'text-white'
}

export function LoadingSpinner({ size = 'default', color = 'gold', className }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )} 
    />
  )
}

// Page loading component
interface PageLoadingProps {
  message?: string
  subMessage?: string
  showLogo?: boolean
  className?: string
}

export function PageLoading({ 
  message = 'Loading...', 
  subMessage,
  showLogo = true,
  className 
}: PageLoadingProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-act-dark-900 via-act-dark-800 to-act-dark-900 flex items-center justify-center",
      className
    )}>
      <div className="text-center space-y-6">
        {showLogo && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-act-gold-400 to-act-gold-600 rounded-2xl flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-act-gold-400 to-act-gold-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <LoadingSpinner size="lg" className="mx-auto" />
          <h2 className="text-xl font-semibold text-act-dark-200">{message}</h2>
          {subMessage && (
            <p className="text-act-dark-400">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Button loading state
interface ButtonLoadingProps {
  text: string
  loadingText?: string
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function ButtonLoading({ text, loadingText = 'Loading...', size = 'default', className }: ButtonLoadingProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <button 
      className={cn(
        "enhanced-button",
        size === 'sm' && "text-sm px-4 py-2",
        size === 'lg' && "text-lg px-8 py-4",
        className
      )}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  )
}

// Skeleton components for loading states
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function Skeleton({ 
  className, 
  variant = 'rectangular', 
  width, 
  height, 
  lines = 1 
}: SkeletonProps) {
  if (variant === 'circular') {
    return (
      <div 
        className={cn(
          "loading-skeleton rounded-full",
          className
        )}
        style={{ 
          width: width || '2.5rem', 
          height: height || '2.5rem' 
        }}
      />
    )
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "loading-skeleton h-4",
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "loading-skeleton",
        variant === 'text' && 'h-4 w-3/4',
        className
      )}
      style={{ width, height }}
    />
  )
}

// Card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("enhanced-card p-6 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" />
        <div className="space-y-2 flex-1">
          <Skeleton height="1.5rem" />
          <Skeleton height="1rem" width="75%" />
        </div>
      </div>
      <Skeleton height="2rem" />
      <div className="space-y-2">
        <Skeleton />
        <Skeleton />
        <Skeleton width="75%" />
      </div>
    </div>
  )
}

// Table skeleton
interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("enhanced-table", className)}>
      <div className="overflow-hidden">
        {/* Header */}
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height="1.25rem" />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4 border-t border-act-gold-500/10">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height="1rem" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Stats skeleton
interface StatsSkeletonProps {
  count?: number
  className?: string
}

export function StatsSkeleton({ count = 4, className }: StatsSkeletonProps) {
  return (
    <div className={cn("grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="enhanced-card p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton height="0.875rem" width="60%" />
              <Skeleton height="2.5rem" width="40%" />
              <Skeleton height="1.25rem" width="30%" />
            </div>
            <Skeleton variant="circular" size="lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("enhanced-card p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton height="1.5rem" width="40%" />
          <Skeleton height="1rem" width="20%" />
        </div>
        <Skeleton height="16rem" className="rounded-lg" />
        <div className="flex space-x-4">
          <Skeleton height="1rem" width="25%" />
          <Skeleton height="1rem" width="25%" />
          <Skeleton height="1rem" width="25%" />
          <Skeleton height="1rem" width="25%" />
        </div>
      </div>
    </div>
  )
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton height="2rem" width="60%" />
          <Skeleton height="1rem" width="40%" />
        </div>
        <Skeleton height="2.5rem" width="10rem" />
      </div>

      {/* Stats Grid */}
      <StatsSkeleton count={4} />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <ChartSkeleton />
          <TableSkeleton rows={6} columns={5} />
        </div>
        <div className="space-y-8">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}

// Loading overlay component
interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ isVisible, message = 'Loading...', className }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-act-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="enhanced-card p-8 text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-act-dark-200 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Pull to refresh indicator
export function PullToRefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  if (!isRefreshing) return null

  return (
    <div className="flex items-center justify-center py-2">
      <div className="flex items-center space-x-2 text-act-gold-400">
        <LoadingSpinner size="sm" />
        <span className="text-sm">Refreshing...</span>
      </div>
    </div>
  )
}

// Progressive loading component
interface ProgressiveLoaderProps {
  steps: Array<{
    id: string
    title: string
    description?: string
    icon?: React.ReactNode
  }>
  currentStep: number
  className?: string
}

export function ProgressiveLoader({ steps, currentStep, className }: ProgressiveLoaderProps) {
  return (
    <div className={cn("enhanced-card p-6", className)}>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-act-dark-200 mb-2">
            {steps[currentStep]?.title}
          </h3>
          {steps[currentStep]?.description && (
            <p className="text-act-dark-400">{steps[currentStep].description}</p>
          )}
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                index < currentStep 
                  ? "bg-act-green-500 text-white" 
                  : index === currentStep 
                    ? "bg-act-gold-500 text-white animate-pulse"
                    : "bg-act-dark-700 text-act-dark-400"
              )}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  index <= currentStep ? "text-act-dark-200" : "text-act-dark-500"
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-act-dark-500">{step.description}</p>
                )}
              </div>
              {step.icon && (
                <div className="text-act-gold-400">
                  {step.icon}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}