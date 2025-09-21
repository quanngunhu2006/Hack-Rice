import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useUpvote, useDownvote, useUserVotes } from "@/hooks/useProposals";
import { useToast } from "@/hooks/useToast";
import { ArrowUp, ArrowDown } from "lucide-react";
import InterestFormPopup from "./InterestFormPopup";

interface VoteSectionProps {
  proposalId: string;
  upvotes: number;
  downvotes: number;
  compact?: boolean;
  onUnverifiedClick?: () => void;
  proposalTitle?: string;
}

export default function VoteSection({
  proposalId,
  upvotes,
  downvotes,
  compact = false,
  onUnverifiedClick,
  proposalTitle = "Proposal",
}: VoteSectionProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(downvotes);
  const [flashColor, setFlashColor] = useState<string>("");
  const [showInterestForm, setShowInterestForm] = useState(false);

  const upvoteMutation = useUpvote();
  const downvoteMutation = useDownvote();
  const { data: userVotes } = useUserVotes();

  const userVote = userVotes?.find((vote) => vote.proposal_id === proposalId);
  const isVerified = profile?.verified_resident;
  const netScore = optimisticUpvotes - optimisticDownvotes;

  // Flash animation effect
  useEffect(() => {
    if (flashColor) {
      const timer = setTimeout(() => setFlashColor(""), 300);
      return () => clearTimeout(timer);
    }
  }, [flashColor]);

  const handleUpvote = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on proposals",
        variant: "destructive",
      });
      return;
    }

    if (!isVerified) {
      if (onUnverifiedClick) {
        onUnverifiedClick();
      } else {
        toast({
          title: "Verification required",
          description: "Please verify your residency to vote on proposals",
          variant: "destructive",
        });
      }
      return;
    }

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

    // Check if upvotes reach 10
    console.log(
      "Debug - Original upvotes:",
      upvotes,
      "Optimistic upvotes:",
      optimisticUpvotes,
      "New upvote count:",
      newUpvoteCount,
      "Is currently upvoted:",
      isCurrentlyUpvoted
    );

    if (newUpvoteCount >= 10) {
      console.log("🎉 GOAL REACHED! Opening popup...");
      // Open the interest form popup
      setShowInterestForm(true);
      console.log("✅ Popup state set to true");
    } else {
      console.log(
        "❌ Goal not reached yet. Need",
        10 - newUpvoteCount,
        "more upvotes"
      );
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

  const handleDownvote = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on proposals",
        variant: "destructive",
      });
      return;
    }

    if (!isVerified) {
      if (onUnverifiedClick) {
        onUnverifiedClick();
      } else {
        toast({
          title: "Verification required",
          description: "Please verify your residency to vote on proposals",
          variant: "destructive",
        });
      }
      return;
    }

    // Flash animation
    setFlashColor("red");

    // Optimistic update
    const isCurrentlyDownvoted = userVote?.vote_type === "down";
    const isCurrentlyUpvoted = userVote?.vote_type === "up";

    if (isCurrentlyDownvoted) {
      // Remove downvote
      setOptimisticDownvotes((prev) => prev - 1);
    } else {
      // Add downvote
      setOptimisticDownvotes((prev) => prev + 1);
      // Remove upvote if it exists
      if (isCurrentlyUpvoted) {
        setOptimisticUpvotes((prev) => prev - 1);
      }
    }

    try {
      await downvoteMutation.mutateAsync(proposalId);
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

  const renderVoteDisplay = () => {
    if (compact) {
      return (
        <div className="flex flex-col items-center gap-2">
          <div
            className={`text-sm font-medium ${
              flashColor === "green"
                ? "animate-pulse text-green-500"
                : flashColor === "red"
                ? "animate-pulse text-red-500"
                : ""
            }`}>
            {netScore}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp
              className={`h-4 w-4 ${
                userVote && userVote.vote_type === "up"
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {optimisticUpvotes}
            </span>
            <ArrowDown
              className={`h-4 w-4 ${
                userVote && userVote.vote_type === "down"
                  ? "text-red-500"
                  : "text-gray-400"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {optimisticDownvotes}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Vote count in the middle */}
        <div className="text-center">
          <div
            className={`text-3xl font-bold ${
              flashColor === "green"
                ? "animate-pulse text-green-500"
                : flashColor === "red"
                ? "animate-pulse text-red-500"
                : ""
            }`}>
            {netScore}
          </div>
          <div className="text-sm text-muted-foreground">
            {optimisticUpvotes} positive • {optimisticDownvotes} negative
          </div>
        </div>

        {/* Vote buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={
              userVote && userVote.vote_type === "up" ? "default" : "outline"
            }
            size="sm"
            onClick={handleUpvote}
            disabled={
              !user ||
              !isVerified ||
              upvoteMutation.isPending ||
              downvoteMutation.isPending
            }
            className="flex items-center gap-1">
            <ArrowUp className="h-4 w-4" />
            Upvote
          </Button>
          <Button
            variant={
              userVote && userVote.vote_type === "down"
                ? "destructive"
                : "outline"
            }
            size="sm"
            onClick={handleDownvote}
            disabled={
              !user ||
              !isVerified ||
              upvoteMutation.isPending ||
              downvoteMutation.isPending
            }
            className="flex items-center gap-1">
            <ArrowDown className="h-4 w-4" />
            Downvote
          </Button>
        </div>
      </div>
    );
  };

  if (!user || !isVerified) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-pointer" onClick={handleUpvote}>
            {renderVoteDisplay()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {!user ? "Sign in to vote" : "Verify residency to vote"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{renderVoteDisplay()}</div>
        </TooltipTrigger>
        <TooltipContent>
          {userVote && userVote.vote_type === "up"
            ? "You've upvoted this proposal"
            : userVote && userVote.vote_type === "down"
            ? "You've downvoted this proposal"
            : "Click to vote"}
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
