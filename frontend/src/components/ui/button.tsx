import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[hsl(158_42%_22%)] text-white shadow-sm hover:bg-[hsl(158_36%_28%)]",
        destructive:
          "bg-[hsl(14_80%_52%)] text-white shadow-sm hover:opacity-90",
        outline:
          "border border-[hsl(34_18%_88%)] bg-transparent hover:bg-[hsl(34_20%_96%)] hover:text-[hsl(158_42%_22%)]",
        secondary:
          "bg-[hsl(34_18%_94%)] text-[hsl(210_15%_12%)] hover:bg-[hsl(34_18%_90%)]",
        ghost:
          "hover:bg-[hsl(34_18%_94%)] hover:text-[hsl(158_42%_22%)]",
        link:
          "text-[hsl(158_42%_22%)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-[10px] px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
