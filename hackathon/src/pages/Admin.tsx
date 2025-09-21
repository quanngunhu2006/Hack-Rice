import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

interface ModerationAction {
  id: string;
  type: "proposal" | "report";
  action: "approve" | "reject";
  reason?: string;
}

export default function Admin() {
  const [, setSelectedItem] = useState<any>(null);
  const [moderationAction, setModerationAction] =
    useState<ModerationAction | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load draft (pending) proposals
  const { data: pendingProposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ["admin-pending-proposals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select("*, profiles:profiles(full_name, nickname)")
        .eq("status", "draft")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // For now we don't have moderation for reports wired up
  const pendingReports: any[] = [];
  const reportsLoading = false;

  const approveMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase
        .from("proposals")
        .update({ status: "published", scope_verified: true })
        .eq("id", proposalId)
        .select();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal"] });
      toast({
        title: "Proposal approved",
        description: "The proposal is now published.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve proposal",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase
        .from("proposals")
        .update({ status: "rejected" })
        .eq("id", proposalId)
        .select();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["proposal"] });
      toast({
        title: "Proposal rejected",
        description: "The proposal has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject proposal",
        variant: "destructive",
      });
    },
  });

  const handleModerationAction = async (
    item: any,
    action: "approve" | "reject",
    type: "proposal" | "report"
  ) => {
    if (action === "reject") {
      setSelectedItem(item);
      setModerationAction({ id: item.id, type, action });
      return;
    }

    try {
      await fetch(`/api/admin/${type}s/${item.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "" }),
      });

      toast({
        title: `${type} ${action}d`,
        description: `The ${type} has been ${action}d successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} ${type}`,
        variant: "destructive",
      });
    }
  };

  const handleRejectWithReason = async () => {
    if (!moderationAction || !rejectionReason.trim()) return;

    try {
      await fetch(
        `/api/admin/${moderationAction.type}s/${moderationAction.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      toast({
        title: `${moderationAction.type} rejected`,
        description: "The item has been rejected with reason",
      });

      setModerationAction(null);
      setSelectedItem(null);
      setRejectionReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject item",
        variant: "destructive",
      });
    }
  };

  const getJurisdictionBadge = (item: any) => {
    if (item.jurisdiction === "city") {
      return <Badge className="bg-green-500">City Level</Badge>;
    } else if (item.jurisdiction === "state") {
      return <Badge className="bg-yellow-500">State Level</Badge>;
    } else if (item.jurisdiction === "federal") {
      return <Badge className="bg-red-500">Federal Level</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const renderProposalCard = (proposal: any) => (
    <Card key={proposal.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{proposal.title}</CardTitle>
            <div className="flex gap-2">
              <Badge>{proposal.category}</Badge>
              {getJurisdictionBadge(proposal)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() =>
                handleModerationAction(proposal, "approve", "proposal")
              }>
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() =>
                handleModerationAction(proposal, "reject", "proposal")
              }>
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{proposal.summary}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {proposal.author_name || "Anonymous"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(proposal.created_at).toLocaleDateString()}
          </div>
          {proposal.location_hint && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {proposal.location_hint}
            </div>
          )}
        </div>

        {proposal.ai_classification && (
          <div className="mt-3 p-2 bg-muted rounded text-xs">
            <strong>AI Classification:</strong> {proposal.ai_classification}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderReportCard = (report: any) => (
    <Card key={report.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Road Report
            </CardTitle>
            <div className="flex gap-2">
              {getJurisdictionBadge(report)}
              {report.media_urls && report.media_urls.length > 0 && (
                <Badge variant="secondary">
                  {report.media_urls.length} photo(s)
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              onClick={() =>
                handleModerationAction(report, "approve", "report")
              }>
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() =>
                handleModerationAction(report, "reject", "report")
              }>
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {report.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {report?.profiles?.full_name ||
              report?.profiles?.nickname ||
              "Anonymous"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(report.created_at).toLocaleDateString()}
          </div>
          {report.street_name && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {report.street_name}
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          Location: {report.lat?.toFixed(4)}, {report.lng?.toFixed(4)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
        <p className="text-muted-foreground">
          Review and moderate pending proposals and reports
        </p>
      </div>

      <Tabs defaultValue="proposals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="proposals" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pending Proposals ({pendingProposals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Pending Reports ({pendingReports?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          {proposalsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingProposals && pendingProposals.length > 0 ? (
            <div className="space-y-4">
              {pendingProposals.map(renderProposalCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No pending proposals
                </h3>
                <p className="text-muted-foreground">
                  All proposals have been reviewed. Check back later for new
                  submissions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reportsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingReports && pendingReports.length > 0 ? (
            <div className="space-y-4">
              {pendingReports.map(renderReportCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No pending reports
                </h3>
                <p className="text-muted-foreground">
                  All reports have been reviewed. Check back later for new
                  submissions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog
        open={!!moderationAction}
        onOpenChange={() => setModerationAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {moderationAction?.type}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this{" "}
              {moderationAction?.type}. This will be sent to the author.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this submission is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModerationAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRejectWithReason}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700">
              Reject with Reason
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
