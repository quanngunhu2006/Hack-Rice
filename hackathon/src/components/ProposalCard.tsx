import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScopeBadge from "@/components/ScopeBadge";
import { Calendar, MapPin, User } from "lucide-react";
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

  return (
    <Link to={`/proposals/${proposal.id}`} className="block">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-wrap gap-2">
              <Badge className={`${categoryColors[proposal.category] ?? 'bg-gray-500'} text-white`}>
                {proposal.category}
              </Badge>
              <Badge variant={proposal.status === 'published' ? 'default' : 'secondary'}>
                {proposal.status || 'pending'}
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

        <CardContent className="pt-0 flex-grow">
          <p className="text-muted-foreground line-clamp-3">
            {proposal.summary}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
