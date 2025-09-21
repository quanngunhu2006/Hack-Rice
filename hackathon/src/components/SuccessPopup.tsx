import { Button } from "@/components/ui/button";
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
import { CheckCircle } from "lucide-react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessPopup({ isOpen, onClose }: SuccessPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border shadow-lg">
        <DialogHeader className="text-center pb-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-green-500 rounded-full shadow-sm">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold text-green-600">
                Congratulations! 🎉
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                We will be in touch!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-center">
              Thank You for Your Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Your information has been successfully submitted. We'll reach out
              to you soon about the next steps for this proposal.
            </CardDescription>
          </CardContent>
        </Card>

        <DialogFooter className="pt-6 bg-card">
          <Button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
