import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const enhancedButtonVariants = cva(
  "enhanced-button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-ring group relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "enhanced-button text-act-dark-900 hover:shadow-glow",
        destructive: "enhanced-button-danger",
        outline: "enhanced-button-outline",
        secondary: "enhanced-button-secondary",
        ghost: "enhanced-button-ghost",
        link: "text-act-gold-400 underline-offset-4 hover:underline hover:text-act-gold-300",
        premium: "enhanced-button bg-gradient-to-r from-act-gold-500 to-act-gold-600 text-white hover:from-act-gold-600 hover:to-act-gold-700 shadow-glow",
        success: "enhanced-button bg-gradient-to-r from-act-green-500 to-act-green-600 text-white hover:from-act-green-600 hover:to-act-green-700",
        warning: "enhanced-button bg-gradient-to-r from-act-gold-500 to-act-gold-600 text-white hover:from-act-gold-600 hover:to-act-gold-700",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-6 text-base",
        xl: "h-14 rounded-2xl px-10 has-[>svg]:px-8 text-lg",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
      loading: {
        true: "cursor-wait",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      loading: false,
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    asChild = false, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          enhancedButtonVariants({ variant, size, loading, className }),
          fullWidth && "w-full"
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="size-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span className="flex-1">{children}</span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
        
        {/* Shimmer effect overlay */}
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, enhancedButtonVariants }