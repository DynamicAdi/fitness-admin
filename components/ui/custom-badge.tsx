import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type BadgeProps } from "@/components/ui/badge"

interface CustomBadgeProps extends Omit<BadgeProps, 'variant'> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

export function CustomBadge({ variant = 'default', className, ...props }: CustomBadgeProps) {
  return (
    <Badge
      {...props}
      className={cn(
        // Default badge styles from shadcn/ui are preserved
        className,
        // Add custom variant styles
        variant === 'success' && 'bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-800 dark:text-green-100',
        variant === 'warning' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-800 dark:text-yellow-100'
      )}
      // Pass a valid shadcn/ui variant for the base styles
      variant={
        variant === 'success' || variant === 'warning'
          ? 'secondary'
          : variant
      }
    />
  )
}