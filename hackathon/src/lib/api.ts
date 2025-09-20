// Backend API integration for KYC, classification, and petition endpoints

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // KYC Verification
  async startKyc(data: {
    full_name: string
    address: string
    zip: string
  }) {
    return this.request<{ verification_url: string }>('/verify/kyc/start', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Classification
  async classifyProposal(text: string) {
    return this.request<{
      isValidScope: boolean
      reason: string
      jurisdiction: 'city' | 'state' | 'federal'
      confidence: number
    }>('/classify', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  }

  // Petitions
  async createPetition(data: {
    proposal_id: string
    title: string
    description: string
  }) {
    return this.request<{ petition_id: string }>('/petitions/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async signPetition(petitionId: string, signature: {
    full_name: string
    consent: boolean
  }) {
    return this.request<{ success: boolean }>(`/petitions/${petitionId}/sign`, {
      method: 'POST',
      body: JSON.stringify(signature),
    })
  }

  async getPetitionSignatures(petitionId: string) {
    return this.request<{
      total_signatures: number
      required_signatures: number
      signatures: Array<{
        full_name: string
        signed_at: string
      }>
    }>(`/petitions/${petitionId}/signatures`)
  }

  // Admin/Moderation
  async getPendingProposals() {
    return this.request<Array<{
      id: string
      title: string
      summary: string
      category: string
      created_at: string
      author_name?: string
      location_hint?: string
      ai_classification?: string
      jurisdiction: 'city' | 'state' | 'federal'
    }>>('/admin/proposals/pending')
  }

  async getPendingReports() {
    return this.request<Array<{
      id: string
      description: string
      street_name?: string
      created_at: string
      lat: number
      lng: number
      media_urls?: string[]
      jurisdiction: 'city' | 'state' | 'federal'
    }>>('/admin/reports/pending')
  }

  async moderateProposal(proposalId: string, action: 'approve' | 'reject', reason?: string) {
    return this.request<{ success: boolean }>(`/admin/proposals/${proposalId}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async moderateReport(reportId: string, action: 'approve' | 'reject', reason?: string) {
    return this.request<{ success: boolean }>(`/admin/reports/${reportId}/${action}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async submitToModeration(data: {
    title: string
    summary: string
    reason: string
  }) {
    return this.request<{ success: boolean }>('/moderate', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient()

// Export individual functions for easier use
export const {
  startKyc,
  classifyProposal,
  createPetition,
  signPetition,
  getPetitionSignatures,
  getPendingProposals,
  getPendingReports,
  moderateProposal,
  moderateReport,
  submitToModeration,
} = apiClient
