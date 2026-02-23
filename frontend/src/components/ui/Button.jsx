import React from 'react'
import { cn } from '../../lib/utils'

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }

    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-lg"
    }

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ring-offset-bg-white",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    )
})

Button.displayName = "Button"
