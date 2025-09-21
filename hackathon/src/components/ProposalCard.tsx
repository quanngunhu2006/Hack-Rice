import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import UpvoteButton from '@/components/UpvoteButton'
import ScopeBadge from '@/components/ScopeBadge'
import { Calendar, MapPin, User } from 'lucide-react'
import type { Proposal } from '@/types/database'

interface ProposalCardProps {
  proposal: Proposal
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const categoryBadgeColors = {
    Roads: 'bg-amber-600',
    Sanitation: 'bg-lime-600',
    Parks: 'bg-emerald-600',
    Safety: 'bg-rose-600',
    Zoning: 'bg-violet-600',
    Other: 'bg-slate-500'
  } as const

  // Soft tinted backgrounds per category for the card surface
  const categoryCardTint = {
    Roads: 'bg-amber-50',
    Sanitation: 'bg-lime-50',
    Parks: 'bg-emerald-50',
    Safety: 'bg-rose-50',
    Zoning: 'bg-violet-50',
    Other: 'bg-slate-50'
  } as const

  return (
    <Card className={`hover:shadow-lg transition-shadow ${categoryCardTint[proposal.category as keyof typeof categoryCardTint]}`}>
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge className={`${categoryBadgeColors[proposal.category as keyof typeof categoryBadgeColors]} text-white`}>
            {proposal.category}
          </Badge>
          <ScopeBadge 
            verified={proposal.scope_verified} 
            compact 
          />
        </div>
        
        <CardTitle>
          <Link 
            to={`/proposals/${proposal.id}`}
            className="hover:text-primary transition-colors"
          >
            {proposal.title}
          </Link>
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
      
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {proposal.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UpvoteButton 
              proposalId={proposal.id}
              upvotes={proposal.upvotes}
              compact
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/proposals/${proposal.id}`}>
                View
              </Link>
            </Button>
            
            {proposal.status === 'petitioning' && (
              <Button size="sm" asChild>
                <Link to={`/proposals/${proposal.id}`}>
                  Sign Petition
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
