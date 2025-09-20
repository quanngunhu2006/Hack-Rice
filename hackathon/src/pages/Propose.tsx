import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'
import { useCreateProposal } from '@/hooks/useProposals'
import { useClassification } from '@/hooks/useClassification'
import ScopeBadge from '@/components/ScopeBadge'
import { debounce } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { FileText, MapPin, AlertTriangle } from 'lucide-react'

const CATEGORIES = ['Roads', 'Sanitation', 'Parks', 'Safety', 'Zoning', 'Other'] as const

const proposalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters'),
  summary: z.string().min(1, 'Summary is required').max(280, 'Summary must be under 280 characters'),
  body_md: z.string().optional(),
  category: z.enum(CATEGORIES),
  location_hint: z.string().optional(),
})

type ProposalForm = z.infer<typeof proposalSchema>

export default function Propose() {
  const [showOutOfScopeDialog, setShowOutOfScopeDialog] = useState(false)
  const [classificationResult, setClassificationResult] = useState<any>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const form = useForm<ProposalForm>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: '',
      summary: '',
      body_md: '',
      category: 'Other',
      location_hint: '',
    },
  })

  const createProposal = useCreateProposal()
  const classifyMutation = useClassification()

  // Debounced scope checking
  const debouncedClassify = debounce(async (text: string) => {
    if (text.length < 10) return
    
    try {
      const result = await classifyMutation.mutateAsync({ text })
      setClassificationResult(result)
    } catch (error) {
      console.error('Classification error:', error)
    }
  }, 1000)

  // Watch title and summary for scope checking
  const watchedTitle = form.watch('title')
  const watchedSummary = form.watch('summary')

  useEffect(() => {
    const combinedText = `${watchedTitle} ${watchedSummary}`.trim()
    if (combinedText) {
      debouncedClassify(combinedText)
    }
  }, [watchedTitle, watchedSummary])

  const onSubmit = async (data: ProposalForm) => {
    // If classified as out of scope, show dialog
    if (classificationResult && !classificationResult.isValidScope) {
      setShowOutOfScopeDialog(true)
      return
    }

    try {
      const result = await createProposal.mutateAsync(data)
      toast({
        title: "Proposal created!",
        description: "Your proposal has been submitted successfully.",
      })
      navigate(`/proposals/${result.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSubmitToModeration = async () => {
    try {
      // Submit to moderation endpoint
      await fetch('/api/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.getValues('title'),
          summary: form.getValues('summary'),
          reason: 'out_of_scope'
        })
      })

      toast({
        title: "Submitted to moderation",
        description: "Your proposal has been sent to moderators for review.",
      })
      
      setShowOutOfScopeDialog(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit to moderation.",
        variant: "destructive"
      })
    }
  }

  const handleForceSubmit = async () => {
    const data = form.getValues()
    try {
      const result = await createProposal.mutateAsync(data)
      toast({
        title: "Proposal created!",
        description: "Your proposal has been submitted for review.",
      })
      navigate(`/proposals/${result.id}`)
      setShowOutOfScopeDialog(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create proposal.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Create a Proposal</h1>
        <p className="text-muted-foreground">
          Propose improvements to your city that fall within local jurisdiction
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proposal Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Fix potholes on Main Street" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A clear, descriptive title for your proposal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Summary ({field.value?.length || 0}/280)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief summary of your proposal..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A concise summary that will appear in listings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location_hint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input 
                                className="pl-10"
                                placeholder="Downtown, 5th Street, etc." 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="body_md"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detailed Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide additional details, context, or reasoning for your proposal. You can use Markdown formatting."
                            className="min-h-[200px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Supports Markdown formatting for rich text
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createProposal.isPending}
                  >
                    {createProposal.isPending ? "Creating..." : "Create Proposal"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scope Check */}
          <Card>
            <CardHeader>
              <CardTitle>Scope Check</CardTitle>
            </CardHeader>
            <CardContent>
              {classifyMutation.isPending && (
                <div className="text-sm text-muted-foreground">
                  Checking scope...
                </div>
              )}
              
              {classificationResult && (
                <ScopeBadge 
                  verified={classificationResult.isValidScope}
                  reason={classificationResult.reason || "Under review"}
                />
              )}
              
              {!classificationResult && !classifyMutation.isPending && (
                <div className="text-sm text-muted-foreground">
                  Start typing to check if your proposal falls within city jurisdiction
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>City-level issues include:</strong>
                <ul className="mt-1 list-disc list-inside text-muted-foreground">
                  <li>Road repairs and traffic</li>
                  <li>Local parks and recreation</li>
                  <li>Waste management</li>
                  <li>Local zoning changes</li>
                  <li>Public safety improvements</li>
                </ul>
              </div>
              
              <div>
                <strong>State/Federal issues:</strong>
                <ul className="mt-1 list-disc list-inside text-muted-foreground">
                  <li>Healthcare policy</li>
                  <li>Education curriculum</li>
                  <li>Immigration</li>
                  <li>Interstate commerce</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Out of scope dialog */}
      <Dialog open={showOutOfScopeDialog} onOpenChange={setShowOutOfScopeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Proposal May Be Out of Scope
            </DialogTitle>
            <DialogDescription>
              Our automated review suggests this proposal might not fall within city jurisdiction. 
              What would you like to do?
            </DialogDescription>
          </DialogHeader>
          
          {classificationResult && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{classificationResult.reason}</p>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowOutOfScopeDialog(false)}>
              Revise Proposal
            </Button>
            <Button variant="outline" onClick={handleSubmitToModeration}>
              Submit to Moderation
            </Button>
            <Button onClick={handleForceSubmit}>
              Submit Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
