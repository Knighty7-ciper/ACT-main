"use client"

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface TouchButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  haptic?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function TouchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = true,
  className = '',
  type = 'button'
}: TouchButtonProps) {
  
  // Haptic feedback simulation
  const triggerHaptic = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10) // Short vibration
    }
  }

  const handleClick = () => {
    if (disabled || loading) return
    
    triggerHaptic()
    onClick?.()
  }

  // Base styles
  const baseStyles = `
    relative inline-flex items-center justify-center font-medium rounded-xl 
    transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed
    select-none touch-manipulation
  `

  // Size variations
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-sm min-h-[44px]', // iOS recommended minimum
    lg: 'px-6 py-4 text-base min-h-[52px]',
    xl: 'px-8 py-6 text-lg min-h-[64px]'
  }

  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
      text-white shadow-lg hover:shadow-xl focus:ring-blue-500
    `,
    secondary: `
      bg-white/10 hover:bg-white/20 text-white border border-white/20 
      hover:border-white/30 focus:ring-white/30
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
      text-white shadow-lg hover:shadow-xl focus:ring-red-500
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
      text-white shadow-lg hover:shadow-xl focus:ring-green-500
    `,
    warning: `
      bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 
      text-black shadow-lg hover:shadow-xl focus:ring-yellow-500
    `
  }

  const finalStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `

  return (
    <button
      type={type}
      className={finalStyles}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <div className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && iconPosition === 'left' && (
          <Icon className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} />
        )}
        <span>{children}</span>
        {Icon && iconPosition === 'right' && (
          <Icon className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} />
        )}
      </div>
    </button>
  )
}