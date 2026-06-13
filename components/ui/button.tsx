import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", ...props }, ref) => {
    return (
      <button
        type={type}
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold rounded-md transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
