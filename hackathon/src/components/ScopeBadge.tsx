import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, Clock } from 'lucide-react'

interface ScopeBadgeProps {
  verified: boolean
  reason?: string
  compact?: boolean
}

export default function ScopeBadge({ verified, reason, compact = false }: ScopeBadgeProps) {
  const badgeContent = compact ? (
    <div className="flex items-center gap-1">
      {verified ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      <span className="text-xs">
        {verified ? 'Verified' : 'Pending'}
      </span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {verified ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      )}
      <span>
        {verified ? 'City-scope verified' : 'Awaiting review'}
      </span>
    </div>
  )

  const badge = (
    <Badge 
      variant={verified ? "default" : "secondary"}
      className={verified ? "bg-green-500 hover:bg-green-600" : ""}
    >
      {badgeContent}
    </Badge>
  )

  if (reason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{reason}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return badge
}
