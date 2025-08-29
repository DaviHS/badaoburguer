import type React from "react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "minimal" | "dots" | "pulse"
  text?: string
  className?: string
}

export function Loading({ size = "md", variant = "default", text, className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div
          className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-brand-red", sizeClasses[size])}
        />
      </div>
    )
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center space-x-1", className)}>
        <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-brand-yellow rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce"></div>
        {text && <span className={cn("ml-3 text-gray-600", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
        <div className={cn("bg-brand-red rounded-full animate-pulse", sizeClasses[size])} />
        {text && <span className={cn("text-gray-600 animate-pulse", textSizeClasses[size])}>{text}</span>}
      </div>
    )
  }

  // Default variant - Badão Burguer themed
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      <div className="relative">
        {/* Outer ring */}
        <div
          className={cn("animate-spin rounded-full border-4 border-gray-200 border-t-brand-red", sizeClasses[size])}
        />

        {/* Inner ring */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "animate-spin rounded-full border-2 border-gray-100 border-b-brand-yellow",
            size === "sm" ? "w-2 h-2" : size === "md" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-8 h-8",
          )}
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />

        {/* Center dot */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "bg-brand-red rounded-full animate-pulse",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-4 h-4",
          )}
        />
      </div>

      {text && (
        <div className="text-center">
          <p className={cn("text-gray-600 font-medium", textSizeClasses[size])}>{text}</p>
          <div className="flex justify-center mt-1 space-x-1">
            <div className="w-1 h-1 bg-brand-red rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1 h-1 bg-brand-yellow rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1 h-1 bg-brand-red rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading overlay for full screen
export function LoadingOverlay({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <Loading size="lg" text={text} />
      </div>
    </div>
  )
}

// Loading skeleton for cards
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
      <div className="space-y-2">
        <div className="bg-gray-200 rounded h-4 w-3/4"></div>
        <div className="bg-gray-200 rounded h-4 w-1/2"></div>
        <div className="bg-gray-200 rounded h-6 w-1/4"></div>
      </div>
    </div>
  )
}

// Loading button state
export function LoadingButton({
  children,
  loading = false,
  className,
  ...props
}: {
  children: React.ReactNode
  loading?: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <button
      className={cn("relative disabled:opacity-50 disabled:cursor-not-allowed", className)}
      disabled={loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading size="sm" variant="minimal" />
        </div>
      )}
      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>
    </button>
  )
}

export function PageLoading({ text = "Carregando página..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loading size="xl" text={text} />
      </div>
    </div>
  )
}

export function SectionLoading({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <Loading size="lg" text={text} />
    </div>
  )
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex space-x-4 p-4 border rounded-lg">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="bg-gray-200 rounded h-4 w-3/4"></div>
            <div className="bg-gray-200 rounded h-4 w-1/2"></div>
          </div>
          <div className="bg-gray-200 rounded h-8 w-20"></div>
        </div>
      ))}
    </div>
  )
}

export function ProductGridLoading({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </div>
  )
}

export function InlineLoading({ text = "Carregando" }: { text?: string }) {
  return (
    <span className="inline-flex items-center space-x-2">
      <Loading size="sm" variant="dots" />
      <span className="text-sm text-gray-600">{text}</span>
    </span>
  )
}
