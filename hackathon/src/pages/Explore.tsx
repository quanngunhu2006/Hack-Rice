import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, TrendingUp, Clock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProposals } from '@/hooks/useProposals'
import ProposalCard from '@/components/ProposalCard'
import { useAuth } from '@/contexts/AuthContext'

const CATEGORIES = ['Roads', 'Sanitation', 'Parks', 'Safety', 'Zoning', 'Other'] as const

export default function Explore() {
  const [activeTab, setActiveTab] = useState('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { user } = useAuth()

  const { data: proposals, isLoading, error } = useProposals({
    q: searchQuery,
    category: selectedCategory,
    sort: activeTab === 'trending' ? 'upvotes' : 'created_at'
  })

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category)
  }

  const renderProposals = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Error loading proposals. Please try again.</p>
          </CardContent>
        </Card>
      )
    }

    if (!proposals || proposals.length === 0) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No proposals yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to propose an improvement to your city!
            </p>
            {user && (
              <Button asChild>
                <Link to="/propose">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Proposal
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {proposals.map((proposal) => (
          <ProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Explore Proposals</h1>
          <p className="text-muted-foreground">
            Discover and support proposals for your city
          </p>
        </div>
        {user && (
          <Button asChild>
            <Link to="/propose">
              <Plus className="mr-2 h-4 w-4" />
              Create Proposal
            </Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search proposals..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Badge>
        ))}
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="h-6"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="newest" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Newest
          </TabsTrigger>
          <TabsTrigger value="nearby" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Near You
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-6">
          {renderProposals()}
        </TabsContent>

        <TabsContent value="newest" className="mt-6">
          {renderProposals()}
        </TabsContent>

        <TabsContent value="nearby" className="mt-6">
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Location-based filtering coming soon! 
                Please allow location access when prompted.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
