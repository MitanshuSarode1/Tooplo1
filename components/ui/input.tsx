import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={`flex w-full border border-slate-200 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 rounded-md focus-visible:outline-none focus:border-[#1b59c4] focus:ring-1 focus:ring-[#1b59c4] disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
