import { useQuery } from '@tanstack/react-query'

interface PendingProposal {
  id: string
  title: string
  summary: string
  category: string
  created_at: string
  author_name?: string
  location_hint?: string
  ai_classification?: string
  jurisdiction: 'city' | 'state' | 'federal'
}

interface PendingReport {
  id: string
  description: string
  street_name?: string
  created_at: string
  lat: number
  lng: number
  media_urls?: string[]
  jurisdiction: 'city' | 'state' | 'federal'
}

export function usePendingProposals() {
  return useQuery({
    queryKey: ['pending-proposals'],
    queryFn: async (): Promise<PendingProposal[]> => {
      const response = await fetch('/api/admin/proposals/pending')
      if (!response.ok) {
        throw new Error('Failed to fetch pending proposals')
      }
      return response.json()
    }
  })
}

export function usePendingReports() {
  return useQuery({
    queryKey: ['pending-reports'],
    queryFn: async (): Promise<PendingReport[]> => {
      const response = await fetch('/api/admin/reports/pending')
      if (!response.ok) {
        throw new Error('Failed to fetch pending reports')
      }
      return response.json()
    }
  })
}
