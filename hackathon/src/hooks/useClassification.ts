import { useMutation } from '@tanstack/react-query'

interface ClassificationResult {
  isValidScope: boolean
  reason: string
  jurisdiction: 'city' | 'state' | 'federal'
  confidence: number
}

export function useClassification() {
  return useMutation({
    mutationFn: async ({ text }: { text: string }): Promise<ClassificationResult> => {
      // Gracefully no-op if the API route doesn't exist in dev
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        // If the route is missing (404) in local dev, default to in-scope and continue UX
        if (response.status === 404) {
          return {
            isValidScope: true,
            reason: 'Classifier offline in dev; allowing submit.',
            jurisdiction: 'city',
            confidence: 0
          }
        }
        throw new Error('Classification failed')
      }

      const data = await response.json()
      return data
    }
  })
}
