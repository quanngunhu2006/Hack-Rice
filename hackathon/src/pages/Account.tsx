import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth0 } from '@auth0/auth0-react'
import { User, History, FileText } from 'lucide-react'
import { useMyProposals } from '@/hooks/useProposals'
import ProposalCard from '@/components/ProposalCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'


export default function Account() {
  const { user, logout } = useAuth0()
  const { data: myProposals, isLoading: isLoadingMyProposals, error: myProposalsError } = useMyProposals()
  const [tab, setTab] = useState<'profile' | 'history'>('profile')

  // Animated bubble for local tabs
  const listRef = useRef<HTMLDivElement | null>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [bubble, setBubble] = useState<{ x: number; width: number; height: number }>({ x: 0, width: 0, height: 0 })

  const indexForTab = (value: string) => ['profile', 'history'].indexOf(value)
  const measure = () => {
    const list = listRef.current
    if (!list) return
    const idx = indexForTab(tab)
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
  }, [tab])

  const handleSignOut = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <User className="h-7 w-7 text-primary" />
            Account
          </h1>
          <p className="text-muted-foreground">
            Manage your profile and verification status
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="button-shine transition-[transform,box-shadow,background-color] duration-150 hover:shadow-md">
          Sign Out
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'profile' | 'history')} className="space-y-6">
        <TabsList ref={listRef} className="relative">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1 top-1 rounded-md bg-background shadow-sm"
            animate={{ x: bubble.x, width: bubble.width, height: bubble.height }}
            transition={{ type: 'spring', stiffness: 520, damping: 32, mass: 0.95 }}
            style={{ willChange: 'transform,width,height' }}
          />
          <TabsTrigger value="profile" className="relative z-10 flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none" ref={(el) => { triggerRefs.current[0] = el }}>
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="history" className="relative z-10 flex items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none" ref={(el) => { triggerRefs.current[1] = el }}>
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Your basic profile information from Auth0
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-3 bg-muted rounded-md">
                  {user?.email || 'Not available'}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <div className="p-3 bg-muted rounded-md">
                  {user?.name || 'Not available'}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Authentication Status</Label>
                <Badge variant="default" className="bg-green-500">
                  Authenticated
                </Badge>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Activity History
              </CardTitle>
              <CardDescription>
                Your proposals, votes, and signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingMyProposals && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
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
              )}

              {myProposalsError && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Failed to load your history. Please try again.</p>
                </div>
              )}

              {!isLoadingMyProposals && !myProposalsError && (!myProposals || myProposals.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No proposals yet.</p>
                  <p className="text-sm">Create a proposal to see it here.</p>
                </div>
              )}

              {!isLoadingMyProposals && !myProposalsError && myProposals && myProposals.length > 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Current proposal</h3>
                    <ProposalCard proposal={myProposals[0]} />
                  </div>

                  {myProposals.slice(1).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Previous proposals</h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {myProposals.slice(1).map((p) => (
                          <ProposalCard key={p.id} proposal={p} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
