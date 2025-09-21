import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScopeBadge from "@/components/ScopeBadge";
import { Calendar, MapPin, User, Target } from "lucide-react";
import { motion } from "framer-motion";
import type { Proposal } from "@/types/database";

interface ProposalCardProps {
  proposal: Proposal;
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const categoryColors: Record<string, string> = {
    Roads: "bg-blue-500",
    Sanitation: "bg-green-500",
    Parks: "bg-emerald-500",
    Safety: "bg-red-500",
    Zoning: "bg-purple-500",
    Other: "bg-gray-500",
  };

  const upvotes = Number(proposal.upvotes) || 0;
  const downvotes = Number(proposal.downvotes) || 0;
  const netScore = upvotes - downvotes;

  // Progress target (can be adjusted or sourced from DB later)
  const goal = 50; // target supporters for next phase
  const clampedProgress = Math.min(Math.max(upvotes / goal, 0), 1);

  return (
    <Link to={`/proposals/${proposal.id}`} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${categoryColors[proposal.category] ?? 'bg-gray-500'} text-white`}>
                {proposal.category}
              </Badge>
              <ScopeBadge
                verified={proposal.scope_verified}
                compact
              />
            </div>
            <div className="text-sm font-medium">
              <span className={`${netScore > 0 ? 'text-emerald-600' : netScore < 0 ? 'text-orange-600' : 'text-slate-500'}`}>
                {netScore > 0 ? '+' : ''}{Math.abs(netScore)}
              </span>
            </div>
          </div>

          <CardTitle className="hover:text-primary transition-colors">
            {proposal.title}
          </CardTitle>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Verified Resident</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
            </div>
            {proposal.location_hint && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{proposal.location_hint}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex-grow flex flex-col">
          <p className="text-muted-foreground line-clamp-3 min-h-[3.75rem]">
            {proposal.summary}
          </p>
          {/* Interest progress */}
          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between mb-1 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4 text-primary" />
                <span>Community interest</span>
              </div>
              <span className="font-medium text-foreground">
                {upvotes} / {goal}
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${clampedProgress * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
