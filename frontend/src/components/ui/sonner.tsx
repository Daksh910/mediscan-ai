import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        style: {
          fontFamily: 'DM Sans, sans-serif',
          fontSize: 13,
          background: 'white',
          border: '1px solid hsl(34 18% 88%)',
          color: 'hsl(210 15% 12%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: 12,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
