import { Button } from '@/components/ui/button'
import { FileText, Eye, User, LogOut } from 'lucide-react'

function Dashboard() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 border-r bg-card">
        <nav className="p-4 space-y-8">
          {/* Proposal Category */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground mb-2">Proposal</h2>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                asChild
              >
                <a href="#file-proposal">
                  <FileText className="h-4 w-4" />
                  File Proposal
                </a>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                asChild
              >
                <a href="#view-proposal">
                  <Eye className="h-4 w-4" />
                  View Proposal
                </a>
              </Button>
            </div>
          </div>

          {/* Account Category */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground mb-2">My Account</h2>
            <div className="space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2"
                asChild
              >
                <a href="#my-account">
                  <User className="h-4 w-4" />
                  Profile
                </a>
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 bg-background">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Content will be added here based on selected navigation */}
      </main>
    </div>
  )
}

export default Dashboard
