import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/contexts/AuthContext'
import { useUpvote, useUserVotes } from '@/hooks/useProposals'
import { useToast } from '@/hooks/useToast'
import { ArrowUp } from 'lucide-react'

interface UpvoteButtonProps {
  proposalId: string
  upvotes: number
  compact?: boolean
  onUnverifiedClick?: () => void
}

export default function UpvoteButton({ 
  proposalId, 
  upvotes, 
  compact = false,
  onUnverifiedClick
}: UpvoteButtonProps) {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(upvotes)
  const [hasVoted, setHasVoted] = useState(false)
  
  const upvoteMutation = useUpvote()
  const { data: userVotes } = useUserVotes()
  
  const userHasVoted = userVotes?.includes(proposalId) || hasVoted
  const isVerified = profile?.verified_resident

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upvote proposals",
        variant: "destructive"
      })
      return
    }

    if (!isVerified) {
      if (onUnverifiedClick) {
        onUnverifiedClick()
      } else {
        toast({
          title: "Verification required",
          description: "Please verify your residency to upvote proposals",
          variant: "destructive"
        })
      }
      return
    }

    if (userHasVoted) {
      toast({
        title: "Already voted",
        description: "You have already upvoted this proposal",
        variant: "destructive"
      })
      return
    }

    // Optimistic update
    setOptimisticUpvotes(prev => prev + 1)
    setHasVoted(true)

    try {
      await upvoteMutation.mutateAsync(proposalId)
      toast({
        title: "Vote cast!",
        description: "Your upvote has been recorded",
      })
    } catch (error: any) {
      // Rollback optimistic update
      setOptimisticUpvotes(upvotes)
      setHasVoted(false)
      
      toast({
        title: "Vote failed",
        description: error.message || "Failed to cast vote",
        variant: "destructive"
      })
    }
  }

  const buttonContent = compact ? (
    <div className="flex items-center gap-1">
      <ArrowUp className={`h-4 w-4 ${userHasVoted ? 'text-primary' : ''}`} />
      <span className="text-sm font-medium">{optimisticUpvotes}</span>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-1">
      <ArrowUp className={`h-5 w-5 ${userHasVoted ? 'text-primary' : ''}`} />
      <span className="text-lg font-bold">{optimisticUpvotes}</span>
      <span className="text-xs text-muted-foreground">
        {optimisticUpvotes === 1 ? 'upvote' : 'upvotes'}
      </span>
    </div>
  )

  if (!user || !isVerified) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={handleUpvote}
            disabled={upvoteMutation.isPending}
            className="flex items-center gap-2"
          >
            {buttonContent}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {!user ? "Sign in to upvote" : "Verify residency to upvote"}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={userHasVoted ? "default" : "outline"}
          size={compact ? "sm" : "default"}
          onClick={handleUpvote}
          disabled={userHasVoted || upvoteMutation.isPending}
          className="flex items-center gap-2"
        >
          {buttonContent}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {userHasVoted ? "You've upvoted this proposal" : "Upvote this proposal"}
      </TooltipContent>
    </Tooltip>
  )
}
