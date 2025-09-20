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
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error('Classification failed')
      }

      const data = await response.json()
      return data
    }
  })
}
