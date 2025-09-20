import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/useToast'
import { CheckCircle, User, CreditCard, Shield } from 'lucide-react'

export default function VerificationWizard() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    zip: '',
    consent: false
  })
  const [showKycDialog, setShowKycDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { updateProfile, profile } = useAuth()
  const { toast } = useToast()

  const handleProfileUpdate = async () => {
    if (!formData.full_name.trim() || !formData.address.trim() || !formData.zip.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await updateProfile({
        full_name: formData.full_name,
        address: formData.address,
        zip: formData.zip
      })
      setStep(2)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartKyc = async () => {
    if (!formData.consent) {
      toast({
        title: "Consent required",
        description: "Please agree to the verification process",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Call backend KYC endpoint
      const response = await fetch('/api/verify/kyc/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          address: formData.address,
          zip: formData.zip
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start KYC process')
      }

      const data = await response.json()
      
      if (data.verification_url) {
        // Open KYC URL in popup
        const popup = window.open(
          data.verification_url,
          'kyc_verification',
          'width=600,height=700,scrollbars=yes,resizable=yes'
        )

        if (popup) {
          setShowKycDialog(true)
          
          // Poll for popup closure
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed)
              setShowKycDialog(false)
              
              // Refresh profile to check verification status
              setTimeout(() => {
                window.location.reload()
              }, 2000)
            }
          }, 1000)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start verification process",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // If already verified, show success state
  if (profile?.verified_resident) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Verification Complete!</h3>
          <p className="text-muted-foreground">
            You are now verified as a resident and can participate in all platform activities.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress indicators */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Profile</span>
        </div>
        
        <div className={`w-12 h-px ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <CreditCard className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Verification</span>
        </div>
        
        <div className={`w-12 h-px ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        
        <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Complete</span>
        </div>
      </div>

      {/* Step 1: Profile Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Provide your basic information to start the verification process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter your full legal name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter your Houston address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code *</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="Enter your ZIP code"
              />
            </div>
            
            <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
              {loading ? "Saving..." : "Continue to Verification"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: KYC Verification */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>
              Complete identity verification to confirm your residency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">What you'll need:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Government-issued photo ID</li>
                <li>• Proof of Houston residency (utility bill, lease, etc.)</li>
                <li>• Phone number for verification</li>
              </ul>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
              />
              <Label htmlFor="consent" className="text-sm">
                I consent to identity verification and understand my information will be securely processed
              </Label>
            </div>
            
            <Button 
              onClick={handleStartKyc} 
              disabled={!formData.consent || loading} 
              className="w-full"
            >
              {loading ? "Starting verification..." : "Start Verification"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KYC in progress dialog */}
      <Dialog open={showKycDialog} onOpenChange={setShowKycDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verification in Progress</DialogTitle>
            <DialogDescription>
              Please complete the verification process in the popup window. 
              This dialog will close automatically when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Complete the steps in the verification window to confirm your identity.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
