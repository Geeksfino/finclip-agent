import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface CollapsiblePanelProps {
  children: React.ReactNode
  isCollapsed: boolean
  onToggle: () => void
  side?: "left" | "right"
  className?: string
}

export function CollapsiblePanel({
  children,
  isCollapsed,
  onToggle,
  side = "left",
  className
}: CollapsiblePanelProps) {
  return (
    <div className={cn("relative flex", className)}>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isCollapsed ? "w-0" : "w-full"
        )}
      >
        {children}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-8 w-8",
          side === "left" ? "-right-4" : "-left-4",
          "z-10 bg-background border shadow-sm"
        )}
        onClick={onToggle}
      >
        {side === "left" ? (
          isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
        ) : (
          isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
