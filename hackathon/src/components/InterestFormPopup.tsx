import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import { Target, Users } from "lucide-react";
import SuccessPopup from "./SuccessPopup";

interface InterestFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  upvoteCount: number;
}

interface InterestForm {
  name: string;
  email: string;
  agreement: boolean;
  signature: string;
}

export default function InterestFormPopup({
  isOpen,
  onClose,
  proposalId,
  upvoteCount,
}: InterestFormPopupProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [formData, setFormData] = useState<InterestForm>({
    name: "",
    email: "",
    agreement: false,
    signature: "",
  });

  const handleInputChange = (
    field: keyof InterestForm,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate all fields are filled out
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.signature.trim()
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields including your signature",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreement) {
      toast({
        title: "Agreement required",
        description: "Please agree to the follow-up terms to continue",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Save form data to Supabase Interest table
      const proposalIdNum = parseInt(proposalId);
      if (isNaN(proposalIdNum)) {
        throw new Error("Invalid proposal ID");
      }

      const { error } = await supabase.from("Interest").insert({
        Name: formData.name.trim(),
        email: formData.email.trim(),
        Digital_Sig: formData.signature.trim(),
      });

      if (error) {
        throw error;
      }

      // Show success popup
      setShowSuccessPopup(true);

      // Reset form
      setFormData({ name: "", email: "", agreement: false, signature: "" });
    } catch (error: any) {
      console.error("Error submitting interest form:", error);
      toast({
        title: "Submission failed",
        description:
          error.message ||
          "Failed to submit your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: "", email: "", agreement: false, signature: "" });
      setShowSuccessPopup(false);
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border shadow-lg">
        <DialogHeader className="text-center pb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-green-500 rounded-full shadow-sm">
              <Target className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-2xl font-semibold text-green-600">
                Great News! 🎉
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                This proposal has gained enough interest. Let's take it to the
                next step!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Community Interest Card */}
          <Card className="border-green-200 bg-green-50 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-full shadow-sm">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-green-900">
                  Community Interest Achieved
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-800">
                With{" "}
                <Badge className="bg-green-500 text-white shadow-sm">
                  {upvoteCount}
                </Badge>{" "}
                community supporters, this proposal has reached the threshold
                for moving forward. Your commitment will help us take the next
                steps toward implementation.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Join the Next Phase</CardTitle>
              <CardDescription>
                Please provide your information to help us move this proposal
                forward.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">What is your name? *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                    className="bg-background border-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">What is your email? *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    disabled={isSubmitting}
                    className="bg-background border-input"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-muted rounded-md border">
                  <Checkbox
                    id="agreement"
                    checked={formData.agreement}
                    onCheckedChange={(checked) =>
                      handleInputChange("agreement", checked as boolean)
                    }
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="agreement">
                      Do you agree to the agreement to follow up with the
                      interest? *
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      By checking this box, you agree to receive updates about
                      this proposal and participate in follow-up activities.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature">Digital Signature *</Label>
                  <Textarea
                    id="signature"
                    value={formData.signature}
                    onChange={(e) =>
                      handleInputChange("signature", e.target.value)
                    }
                    placeholder="Type your full name here to act as your digital signature..."
                    className="min-h-[80px] resize-none bg-background border-input"
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-muted-foreground">
                    By typing your name above, you confirm your commitment to
                    support this proposal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-3 pt-6 bg-card">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-input">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.name.trim() ||
              !formData.email.trim() ||
              !formData.signature.trim() ||
              !formData.agreement
            }
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
            {isSubmitting ? "Submitting..." : "Commit to Next Steps"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Success Popup */}
      <SuccessPopup isOpen={showSuccessPopup} onClose={handleSuccessClose} />
    </Dialog>
  );
}
