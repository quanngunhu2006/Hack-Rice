import { useParams, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { useProposal } from '@/hooks/useProposals'
import { useAuth } from '@/contexts/AuthContext'
import VoteSection from '@/components/VoteSection'
import ScopeBadge from '@/components/ScopeBadge'
import MarkdownViewer from '@/components/MarkdownViewer'
import VerificationWizard from '@/components/VerificationWizard'
import { ArrowLeft, MapPin, User, Calendar, FileSignature } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProposalDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  
  const { data: proposal, isLoading, error } = useProposal(id!)

  if (!id) {
    return <Navigate to="/" replace />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explore
          </Link>
        </Button>
        <Card>
          <CardContent className="py-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Proposal not found</h2>
            <p className="text-muted-foreground">
              The proposal you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleUpvoteClick = () => {
    if (!user) {
      // Redirect to login
      return
    }
    
    if (!profile?.verified_resident) {
      setShowVerificationDialog(true)
      return
    }
    
    // Handle upvote through UpvoteButton component
  }

  const handleSignPetition = () => {
    if (!user) {
      // Redirect to login
      return
    }
    
    if (!profile?.verified_resident) {
      setShowVerificationDialog(true)
      return
    }
    
    // TODO: Implement petition signing
    console.log('Sign petition for proposal:', proposal.id)
  }

  const categoryColors: Record<string, string> = {
    Roads: 'bg-blue-500',
    Sanitation: 'bg-green-500',
    Parks: 'bg-emerald-500',
    Safety: 'bg-red-500',
    Zoning: 'bg-purple-500',
    Other: 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Button variant="ghost" asChild>
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge 
                  className={`${categoryColors[proposal.category]} text-white`}
                >
                  {proposal.category}
                </Badge>
                <Badge variant={proposal.status === 'published' ? 'default' : 'secondary'}>
                  {proposal.status}
                </Badge>
              </div>
              
              <CardTitle className="text-2xl">{proposal.title}</CardTitle>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Verified Resident
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(proposal.created_at).toLocaleDateString()}
                </div>
                {proposal.location_hint && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {proposal.location_hint}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-lg mb-4">{proposal.summary}</p>
              
              {proposal.body_md && (
                <MarkdownViewer content={proposal.body_md} />
              )}
            </CardContent>
          </Card>

          {/* Petition Section */}
          {proposal.status === 'petitioning' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Sign the Petition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  This proposal has reached enough support to start a petition! 
                  Add your signature to help bring it to the city council.
                </p>
                <Button onClick={handleSignPetition} className="w-full sm:w-auto">
                  Sign Petition
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Voting */}
          <Card>
            <CardHeader>
              <CardTitle>Community Support</CardTitle>
            </CardHeader>
            <CardContent>
              <VoteSection
                proposalId={proposal.id}
                onUnverifiedClick={handleUpvoteClick}
              />
            </CardContent>
          </Card>

          {/* Scope Verification */}
          <Card>
            <CardHeader>
              <CardTitle>Scope Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ScopeBadge 
                verified={proposal.scope_verified}
                reason={proposal.scope_verified ? "This falls within city jurisdiction" : "Under review by moderators"}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verification Required</DialogTitle>
            <DialogDescription>
              You need to verify your residency to upvote proposals and sign petitions.
            </DialogDescription>
          </DialogHeader>
          <VerificationWizard />
        </DialogContent>
      </Dialog>
    </div>
  )
}
