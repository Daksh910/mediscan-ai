import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-[10px] border border-[hsl(34_18%_88%)] bg-[hsl(34_18%_94%)] px-3 py-1 text-sm text-[hsl(210_15%_12%)] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[hsl(210_8%_62%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(158_42%_22%)] focus-visible:border-[hsl(158_42%_22%)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
