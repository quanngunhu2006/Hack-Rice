import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth0 } from '@auth0/auth0-react'
import { 
  Home, 
  FileText, 
  Plus, 
  MapPin, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function Navigation() {
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth0()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const [steppingIndex, setSteppingIndex] = useState<number | null>(null)
  const [isAnimatingNav, setIsAnimatingNav] = useState(false)
  const controls = useAnimationControls()
  const listRef = useRef<HTMLUListElement | null>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [positions, setPositions] = useState<{ y: number; height: number; centerY: number }[]>([])
  const [bubbleHeight, setBubbleHeight] = useState<number>(0)

  // Animation variants for mobile menu reveal (slide from top)
  const menuVariants = {
    hidden: { y: -24, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { y: -24, opacity: 0 }
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0 }
  } as const

  const navItems = useMemo(() => ([
    { path: '/', icon: Home, label: 'Explore' },
    { path: '/propose', icon: Plus, label: 'Propose', requireAuth: true },
    { path: '/map', icon: MapPin, label: 'Map' },
    { path: '/account', icon: User, label: 'Account', requireAuth: true },
    { path: '/admin', icon: Settings, label: 'Admin', requireAuth: true },
  ]), [])

  const [showSignOutDialog, setShowSignOutDialog] = useState(false)
  const handleSignOut = () => setShowSignOutDialog(true)
  const confirmSignOut = () => {
    setShowSignOutDialog(false)
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const activeIdx = navItems.findIndex((it) => isActivePath(it.path))
  const currentIndex: number | null = activeIdx >= 0 ? activeIdx : null

  // Derive current page title for header and document.title
  const currentTitle = useMemo(() => {
    if (location.pathname.startsWith('/proposals/')) return 'Proposal'
    if (location.pathname.startsWith('/login')) return 'Login'
    const match = navItems.find((it) => isActivePath(it.path))
    return match?.label ?? 'CitizenVoice'
  }, [location.pathname, navItems])

  useEffect(() => {
    document.title = `${currentTitle} • CitizenVoice`
  }, [currentTitle])

  // Measure item positions for desktop bubble animation
  const rafRef = useRef<number | null>(null)
  const measurePositions = () => {
    if (!listRef.current) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const listRect = listRef.current!.getBoundingClientRect()
      const next = itemRefs.current.map((el) => {
        const r = el?.getBoundingClientRect()
        if (!r) return { y: 0, height: 0, centerY: 0 }
        const y = r.top - listRect.top
        const height = r.height
        return { y, height, centerY: y + height / 2 }
      })
      setPositions(next)
      if (currentIndex != null && next[currentIndex]) {
        setBubbleHeight(next[currentIndex].height)
        controls.set({ y: next[currentIndex].y, scaleY: 1 })
      }
    })
  }

  useLayoutEffect(() => {
    measurePositions()
    const onResize = () => measurePositions()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    // Re-measure when route changes or menu state changes
    measurePositions()
  }, [location.pathname, isMobileMenuOpen])

  const canAccessRoute = (item: any) => {
    if (item.requireAuth && !isAuthenticated) return false
    return true
  }

  useEffect(() => {
    // Clear stepping animation when the route changes
    setSteppingIndex(null)
    setIsAnimatingNav(false)
  }, [location.pathname])

  const handleNavClick = async (e: any, item: any, index: number, canAccess: boolean) => {
    e.preventDefault()
    if (isAnimatingNav) return
    const targetPath = canAccess ? item.path : '/login'
    if (location.pathname === targetPath) {
      setIsMobileMenuOpen(false)
      return
    }

    const startIndex = (steppingIndex ?? (currentIndex ?? 0))
    const endIndex = index
    if (startIndex === endIndex) {
      navigate(targetPath)
      setIsMobileMenuOpen(false)
      return
    }

    // If mobile (menu open or below lg breakpoint), skip animation and navigate immediately
    const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
    if (!isDesktop || isMobileMenuOpen) {
      navigate(targetPath)
      setIsMobileMenuOpen(false)
      return
    }

    setIsAnimatingNav(true)
    const startPos = positions[startIndex]
    const destPos = positions[endIndex]
    if (startPos) {
      controls.set({ y: startPos.y, scaleY: 1 })
    }
    if (destPos) {
      setSteppingIndex(endIndex)
      setBubbleHeight(destPos.height)
      // Kick off the visual transition immediately, but don't block navigation
      const run = async () => {
        await controls.start({ y: destPos.y, scaleY: 0.85, transition: { duration: 0.14, ease: 'easeOut' } })
        await controls.start({
          y: destPos.y,
          scaleY: 1,
          transition: { type: 'spring', stiffness: 560, damping: 28, mass: 0.95 }
        })
        setIsAnimatingNav(false)
      }
      void run()
    } else {
      setIsAnimatingNav(false)
    }

    // Navigate right away so page transition and bubble start simultaneously
    navigate(targetPath)
    setIsMobileMenuOpen(false)
  }

  const NavLink = ({ item, index }: { item: any, index: number }) => {
    const Icon = item.icon
    const canAccess = canAccessRoute(item)
    const highlightedIndex = (steppingIndex ?? currentIndex)
    const isHighlighted = highlightedIndex === index

    return (
      <Link
        to={canAccess ? item.path : '/login'}
        className={`relative overflow-hidden flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isHighlighted 
            ? 'text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        } ${!canAccess ? 'opacity-50' : ''}`}
        aria-current={isHighlighted ? 'page' : undefined}
        onClick={(e) => handleNavClick(e, item, index, canAccess)}
        ref={(el) => {
          itemRefs.current[index] = el
        }}
      >
        {/* Static highlight for mobile only; desktop uses the animated bubble */}
        {isHighlighted && (
          <span className="pointer-events-none absolute inset-0 rounded-lg bg-primary lg:hidden" />
        )}
        <Icon className="h-5 w-5 relative z-10" />
        <span className="font-medium relative z-10">{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will be signed out of CityVoice on this device.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSignOutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="button-shine border" onClick={confirmSignOut}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-secondary/70 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:14px_14px] px-6 pt-8 pb-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">CityVoice</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul ref={listRef} role="list" className="relative flex flex-1 flex-col gap-y-2">
              {/* Desktop bubble indicator */}
              {currentIndex != null && positions[currentIndex] && (
                <motion.div
                  aria-hidden
                  className="hidden lg:block pointer-events-none absolute left-0 right-0 rounded-lg bg-primary"
                  style={{ height: bubbleHeight || (positions[currentIndex]?.height ?? 0), willChange: 'transform,height' }}
                  animate={controls}
                  initial={false}
                />
              )}
              {navItems.map((item, index) => (
                <li key={item.path}>
                  <NavLink item={item} index={index} />
                </li>
              ))}
            </ul>

            {/* User section */}
            <div className="mt-auto">
            <div className="bg-card/95 border border-foreground/30 rounded-lg p-4 pb-[14px] space-y-3 shadow-sm mx-[-14px] px-[10px]">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm rounded-md bg-muted/80 border border-foreground/30 text-muted-foreground cursor-default select-text">
                    <div className="font-medium truncate">{user?.email}</div>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full justify-center gap-3 button-shine border"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button asChild className="w-full button-shine">
                  <Link to="/login">Sign In</Link>
                </Button>
              )}
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className={`flex items-center justify-between p-4 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 transition-[background-color,box-shadow] duration-200 ${isMobileMenuOpen ? 'shadow-sm' : ''}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">CityVoice</h1>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* subtle overlay to focus attention */}
              <motion.div
                className="fixed inset-0 z-40 bg-foreground/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                id="mobile-menu"
                className="lg:hidden fixed z-50 left-0 right-0 top-16"
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <div className="border-b bg-background px-4 py-2 transition-all duration-200">
                  <nav className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.path}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                      >
                        <NavLink item={item} index={index} />
                      </motion.div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      {isAuthenticated ? (
                        <>
                          <div className="px-3 py-2 text-sm">
                            <div className="font-medium truncate">{user?.email}</div>
                          </div>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3"
                            onClick={handleSignOut}
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <Button asChild className="w-full">
                          <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            Sign In
                          </Link>
                        </Button>
                      )}
                    </div>
                  </nav>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}