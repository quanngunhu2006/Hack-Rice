import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, TrendingUp, Clock, MapPin, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProposals } from '@/hooks/useProposals'
import ProposalCard from '@/components/ProposalCard'
import { useAuth0 } from '@auth0/auth0-react'

const CATEGORIES = ['Roads', 'Sanitation', 'Parks', 'Safety', 'Zoning', 'Other'] as const

export default function Explore() {
  const [activeTab, setActiveTab] = useState('trending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { isAuthenticated } = useAuth0()

  // Animated bubble for tab filters
  const listRef = useRef<HTMLDivElement | null>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [bubble, setBubble] = useState<{ x: number; width: number; height: number }>({ x: 0, width: 0, height: 0 })

  const indexForTab = (value: string) => ['trending', 'newest', 'nearby'].indexOf(value)

  const measure = () => {
    const list = listRef.current
    if (!list) return
    const idx = indexForTab(activeTab)
    const el = triggerRefs.current[idx]
    if (!el) return
    const listRect = list.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    const styles = window.getComputedStyle(list)
    const paddingLeft = parseFloat(styles.paddingLeft || '0')
    setBubble({ x: rect.left - listRect.left - paddingLeft, width: rect.width, height: rect.height })
  }

  useLayoutEffect(() => {
    measure()
    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    measure()
  }, [activeTab])

  const getSortField = () => {
    switch (activeTab) {
      case 'trending':
        return 'upvotes'
      case 'newest':
        return 'created_at'
      case 'nearby':
        // For now, sort by location_hint alphabetically
        // In a real implementation, you'd sort by geographical distance
        return 'location_hint'
      default:
        return 'created_at'
    }
  }

  const { data: proposals, isLoading, error } = useProposals({
    q: searchQuery,
    category: selectedCategory,
    sort: getSortField()
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
            {isAuthenticated && (
              <Button asChild className="button-shine border-animate transition-[transform,box-shadow,background-color] duration-150">
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
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-1">
            <FileText className="h-7 w-7 text-primary" />
            Explore Proposals
          </h1>
          <p className="text-muted-foreground">
            Discover and support proposals for your city
          </p>
        </div>
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
        <div className="flex items-center justify-between gap-3">
          <TabsList ref={listRef} className="relative">
          {/* Animated bubble */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1 top-1 rounded-md bg-background shadow-sm"
            animate={{ x: bubble.x, width: bubble.width, height: bubble.height }}
            transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.95 }}
            style={{ willChange: 'transform,width,height' }}
          />
          <TabsTrigger
            value="trending"
            className="relative z-10 flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            ref={(el) => {
              triggerRefs.current[0] = el
            }}
          >
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="newest"
            className="relative z-10 flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            ref={(el) => {
              triggerRefs.current[1] = el
            }}
          >
            <Clock className="h-4 w-4" />
            Newest
          </TabsTrigger>
          <TabsTrigger
            value="nearby"
            className="relative z-10 flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            ref={(el) => {
              triggerRefs.current[2] = el
            }}
          >
            <MapPin className="h-4 w-4" />
            Near You
          </TabsTrigger>
          </TabsList>
            {isAuthenticated && (
          <Button asChild className="button-shine border-animate transition-[transform,box-shadow,background-color] duration-150">
              <Link to="/propose">
                <Plus className="mr-2 h-4 w-4" />
                Create Proposal
              </Link>
            </Button>
          )}
        </div>

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
