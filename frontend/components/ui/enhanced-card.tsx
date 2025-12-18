import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const enhancedCardVariants = cva(
  "enhanced-card relative transition-all duration-300 group",
  {
    variants: {
      variant: {
        default: "enhanced-card",
        elevated: "enhanced-card-elevated shadow-2xl",
        subtle: "enhanced-card-subtle",
        interactive: "enhanced-card-interactive cursor-pointer",
        glass: "backdrop-blur-glass bg-white/10 border-white/20",
        premium: "border-2 border-act-gold-500/50 bg-gradient-to-br from-act-gold-500/10 to-act-gold-600/5",
        success: "border-act-green-500/50 bg-act-green-500/10",
        warning: "border-act-gold-500/50 bg-act-gold-500/10",
        error: "border-act-red-500/50 bg-act-red-500/10",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      size: {
        default: "",
        sm: "max-w-sm",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "w-full",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-2 hover:shadow-glow-lg",
        scale: "hover:scale-105",
        glow: "hover:shadow-glow",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      size: "default",
      hover: "lift",
    },
  }
)

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedCardVariants> {
  asChild?: boolean
  children: React.ReactNode
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, padding, size, hover, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(enhancedCardVariants({ variant, padding, size, hover }), className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-6", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xl font-semibold leading-none tracking-tight text-act-dark-200", className)}
    {...props}
  >
    {children}
  </div>
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-act-dark-400 leading-relaxed", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("pt-0", className)}
    {...props}
  />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

// Stats Card Component
const StatsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    change?: {
      value: number
      type: 'positive' | 'negative' | 'neutral'
    }
    icon?: React.ReactNode
    trend?: 'up' | 'down' | 'stable'
  }
>(({ className, title, value, change, icon, trend, ...props }, ref) => (
  <EnhancedCard variant="elevated" className={cn("enhanced-stats-card", className)} {...props}>
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="enhanced-stats-label">{title}</p>
        <p className="enhanced-stats-number">{value}</p>
        {change && (
          <div className={cn(
            "enhanced-stats-change",
            change.type === 'positive' && "positive",
            change.type === 'negative' && "negative",
            change.type === 'neutral' && "gray"
          )}>
            {change.type === 'positive' ? '↗' : change.type === 'negative' ? '↘' : '→'} {Math.abs(change.value)}%
          </div>
        )}
      </div>
      {icon && (
        <div className="p-3 rounded-xl bg-act-gold-500/10 border border-act-gold-500/20">
          {icon}
        </div>
      )}
    </div>
  </EnhancedCard>
))
StatsCard.displayName = "StatsCard"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  StatsCard,
  enhancedCardVariants,
}