import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Search, AlertCircle, CheckCircle } from 'lucide-react'

const enhancedInputVariants = cva(
  "enhanced-input w-full transition-all duration-200 focus-ring",
  {
    variants: {
      variant: {
        default: "enhanced-input",
        glass: "backdrop-blur-glass bg-white/10 border-white/20 text-white placeholder:text-white/60",
        filled: "bg-act-dark-800 border-act-dark-700 text-white placeholder:text-act-dark-400",
        outline: "bg-transparent border-2 border-act-gold-500/20 hover:border-act-gold-500/40",
      },
      size: {
        sm: "h-9 px-3 py-2 text-sm",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-5 py-3 text-base",
        xl: "h-14 px-6 py-4 text-lg",
      },
      state: {
        default: "",
        success: "border-act-green-500 focus:border-act-green-500 focus:ring-act-green-500/20",
        error: "border-act-red-500 focus:border-act-red-500 focus:ring-act-red-500/20",
        warning: "border-act-gold-500 focus:border-act-gold-500 focus:ring-act-gold-500/20",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
)

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof enhancedInputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  success?: string
  showPasswordToggle?: boolean
  searchable?: boolean
  label?: string
  required?: boolean
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state,
    leftIcon, 
    rightIcon, 
    error, 
    success,
    showPasswordToggle = false,
    searchable = false,
    label,
    required,
    type = "text",
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [focused, setFocused] = React.useState(false)

    const inputType = showPasswordToggle && type === "password" 
      ? (showPassword ? "text" : "password") 
      : type

    const finalState = error ? "error" : success ? "success" : state

    const inputClasses = cn(
      enhancedInputVariants({ variant, size, state: finalState }),
      leftIcon && "pl-10",
      (rightIcon || showPasswordToggle || searchable) && "pr-10",
      className
    )

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-act-dark-200">
            {label}
            {required && <span className="text-act-red-400 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-act-dark-400">
              {leftIcon}
            </div>
          )}
          
          {searchable && !leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-act-dark-400">
              <Search className="size-4" />
            </div>
          )}

          <input
            type={inputType}
            className={inputClasses}
            ref={ref}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {rightIcon && !showPasswordToggle && !searchable && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-act-dark-400">
              {rightIcon}
            </div>
          )}

          {showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-act-dark-400 hover:text-act-dark-200 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}

          {searchable && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-act-dark-400">
              <Search className="size-4" />
            </div>
          )}

          {finalState === "success" && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-act-green-400">
              <CheckCircle className="size-4" />
            </div>
          )}

          {finalState === "error" && !rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-act-red-400">
              <AlertCircle className="size-4" />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-act-red-400 flex items-center gap-1">
            <AlertCircle className="size-3" />
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-act-green-400 flex items-center gap-1">
            <CheckCircle className="size-3" />
            {success}
          </p>
        )}
      </div>
    )
  }
)
EnhancedInput.displayName = "EnhancedInput"

// Textarea component
const enhancedTextareaVariants = cva(
  "enhanced-input min-h-[80px] resize-vertical",
  {
    variants: {
      variant: {
        default: "enhanced-input",
        glass: "backdrop-blur-glass bg-white/10 border-white/20 text-white placeholder:text-white/60",
        filled: "bg-act-dark-800 border-act-dark-700 text-white placeholder:text-act-dark-400",
        outline: "bg-transparent border-2 border-act-gold-500/20 hover:border-act-gold-500/40",
      },
      size: {
        sm: "min-h-[60px] p-3 text-sm",
        default: "min-h-[80px] p-4",
        lg: "min-h-[100px] p-5 text-base",
        xl: "min-h-[120px] p-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof enhancedTextareaVariants> {
  label?: string
  error?: string
  success?: string
  required?: boolean
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ className, variant, size, label, error, success, required, ...props }, ref) => {
    const finalState = error ? "error" : success ? "success" : "default"

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-act-dark-200">
            {label}
            {required && <span className="text-act-red-400 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          className={cn(enhancedTextareaVariants({ variant, size }), className)}
          ref={ref}
          {...props}
        />

        {error && (
          <p className="text-sm text-act-red-400 flex items-center gap-1">
            <AlertCircle className="size-3" />
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-act-green-400 flex items-center gap-1">
            <CheckCircle className="size-3" />
            {success}
          </p>
        )}
      </div>
    )
  }
)
EnhancedTextarea.displayName = "EnhancedTextarea"

export { 
  EnhancedInput, 
  EnhancedTextarea, 
  enhancedInputVariants, 
  enhancedTextareaVariants 
}