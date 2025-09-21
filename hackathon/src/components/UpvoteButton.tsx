import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useUpvote, useUserVotes } from "@/hooks/useProposals";
import { useToast } from "@/hooks/useToast";
import InterestFormPopup from "./InterestFormPopup";

interface UpvoteButtonProps {
  proposalId: string;
  upvotes: number;
  downvotes?: number;
  compact?: boolean;
  onUnverifiedClick?: () => void;
}

export default function UpvoteButton({
  proposalId,
  upvotes,
  downvotes = 0,
  compact = false,
}: UpvoteButtonProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(downvotes);
  const [flashColor, setFlashColor] = useState<string>("");
  const [showInterestForm, setShowInterestForm] = useState(false);

  const upvoteMutation = useUpvote();
  const { data: userVotes } = useUserVotes();

  const userVote = userVotes?.find(vote => vote.proposal_id === proposalId)
  const isUserVoteUp = userVote && userVote.vote_type === 'up'
  const isVerified = profile?.verified_resident
  const netScore = optimisticUpvotes - optimisticDownvotes

  const handleUpvote = async () => {
    // Authentication temporarily disabled for demo - backend handles demo users
    // if (!user) {
    //   toast({
    //     title: "Sign in required",
    //     description: "Please sign in to vote on proposals",
    //     variant: "destructive"
    //   })
    //   return
    // }

    // Verification temporarily disabled - users can vote without verification
    // if (!isVerified) {
    //   if (onUnverifiedClick) {
    //     onUnverifiedClick()
    //   } else {
    //     toast({
    //       title: "Verification required",
    //       description: "Please verify your residency to vote on proposals",
    //       variant: "destructive"
    //     })
    //   }
    //   return
    // }

    // Flash animation
    setFlashColor("green");

    // Optimistic update
    const isCurrentlyUpvoted = userVote?.vote_type === "up";
    const isCurrentlyDownvoted = userVote?.vote_type === "down";

    let newUpvoteCount = optimisticUpvotes;

    if (isCurrentlyUpvoted) {
      // Remove upvote
      newUpvoteCount = optimisticUpvotes - 1;
      setOptimisticUpvotes(newUpvoteCount);
    } else {
      // Add upvote
      newUpvoteCount = optimisticUpvotes + 1;
      setOptimisticUpvotes(newUpvoteCount);
      // Remove downvote if it exists
      if (isCurrentlyDownvoted) {
        setOptimisticDownvotes((prev) => prev - 1);
      }
    }

    // Trigger interest form when the user adds an upvote that crosses the threshold
    const INTEREST_THRESHOLD = 2; // testing threshold
    if (!isCurrentlyUpvoted && newUpvoteCount >= INTEREST_THRESHOLD) {
      setShowInterestForm(true);
    }

    try {
      await upvoteMutation.mutateAsync(proposalId);
    } catch (error: any) {
      // Rollback optimistic update on error
      setOptimisticUpvotes(upvotes);
      setOptimisticDownvotes(downvotes);
      setFlashColor(""); // Clear flash on error

      toast({
        title: "Vote failed",
        description: error.message || "Failed to cast vote",
        variant: "destructive",
      });
    }
  };

  const buttonContent = compact ? (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`text-sm font-medium ${
          flashColor === "green" ? "animate-pulse text-green-500" : ""
        }`}>
        {netScore}
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`text-lg font-bold ${
          flashColor === "green" ? "animate-pulse text-green-500" : ""
        }`}>
        {netScore}
      </div>
    </div>
  );

  if (!user || !isVerified) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={handleUpvote}
              disabled={upvoteMutation.isPending}
              className="flex items-center gap-2">
              {buttonContent}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!user ? "Sign in to vote" : "Verify residency to vote"}
          </TooltipContent>
        </Tooltip>

        {/* Interest Form Popup */}
        <InterestFormPopup
          isOpen={showInterestForm}
          onClose={() => setShowInterestForm(false)}
          proposalId={proposalId}
          upvoteCount={optimisticUpvotes}
        />
      </>
    );
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={handleUpvote}
            disabled={upvoteMutation.isPending}
            className={`flex items-center gap-2 ${
              isUserVoteUp
                ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                : ''
            }`}
          >
            {buttonContent}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isUserVoteUp ? "You've upvoted this proposal" : "Upvote this proposal"}
        </TooltipContent>
      </Tooltip>

      {/* Interest Form Popup */}
      <InterestFormPopup
        isOpen={showInterestForm}
        onClose={() => setShowInterestForm(false)}
        proposalId={proposalId}
        upvoteCount={optimisticUpvotes}
      />
    </>
  )
}
