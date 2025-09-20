import { useEffect, useMemo, useState } from 'react'
import { Activity, Users, FileText, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase'

type Proposal = {
  id: string | number
  title?: string
  location?: string
  created_at?: string
}

function Dashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true)
      const { data } = await supabase.from('proposals').select('*').limit(20)
      setProposals(Array.isArray(data) ? data : [])
      setLoading(false)
    }
    fetchProposals()
  }, [])

  const stats = useMemo(() => ([
    { title: 'Total Proposals', value: String(proposals.length), change: '+0%', icon: FileText, trend: 'up' },
    { title: 'Active Judges', value: '—', change: '+0%', icon: Users, trend: 'up' },
    { title: 'Nearby Events', value: '—', change: '+0%', icon: MapPin, trend: 'up' },
    { title: 'Activity', value: loading ? 'Loading' : 'OK', change: '', icon: Activity, trend: 'up' }
  ]), [proposals, loading])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Nearby / Recent Proposals */}
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Proposals Nearby</h2>
          <Button size="sm" variant="outline" asChild>
            <a href="/proposals/upload" className="flex items-center gap-2"><Plus className="h-4 w-4"/>New Proposal</a>
          </Button>
        </div>
        <div className="space-y-4">
          {proposals.map((p) => (
            <div key={String(p.id)} className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.title ?? `Proposal ${String(p.id)}`}</p>
                <p className="text-sm text-muted-foreground truncate">{p.location ?? 'Unknown location'}</p>
              </div>
              <span className="text-sm text-muted-foreground">{p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}</span>
            </div>
          ))}
          {!loading && proposals.length === 0 && (
            <p className="text-sm text-muted-foreground">No proposals yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
