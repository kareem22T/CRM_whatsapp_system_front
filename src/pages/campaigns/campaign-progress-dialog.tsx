"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/app/hooks"
import type { Campaign, CampaignProgress } from "@/types/campaign"

interface CampaignProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
}

export function CampaignProgressDialog({ open, onOpenChange, campaign }: CampaignProgressDialogProps) {
  const [progress, setProgress] = useState<CampaignProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const token = useAppSelector((state) => state.auth.token)

  useEffect(() => {
    if (open && campaign) {
      fetchProgress()
      // Set up polling for real-time updates
      const interval = setInterval(fetchProgress, 5000)
      return () => clearInterval(interval)
    }
  }, [open, campaign])

  const fetchProgress = async () => {
    if (!campaign) return

    try {
      setLoading(true)
      const response = await fetch(`http://67.211.221.109:3002/campaign/${campaign.id}/progress`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setProgress(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch campaign progress",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch campaign progress",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "paused":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Campaign Progress: {campaign?.name}
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>Real-time progress tracking and statistics</DialogDescription>
        </DialogHeader>

        {progress ? (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(progress.status)}
                  Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Campaign Status:</span>
                  <Badge variant={progress.status === "running" ? "default" : "secondary"}>
                    {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress.progressPercentage}%</span>
                  </div>
                  <Progress value={progress.progressPercentage} className="w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Success Rate:</span>
                    <div className="font-medium">{progress.successRate}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span>
                    <div className="font-medium">{progress.remainingContacts} contacts</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Message Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{progress.totalContacts}</div>
                    <div className="text-sm text-muted-foreground">Total Contacts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{progress.messagesSent}</div>
                    <div className="text-sm text-muted-foreground">Messages Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{progress.messagesPending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{progress.messagesFailed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Started At:</span>
                    <div className="font-medium">{formatDate(progress.startedAt)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Sent:</span>
                    <div className="font-medium">{formatDate(progress.lastSent)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Next Send:</span>
                    <div className="font-medium">{formatDate(progress.nextSendAt)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Est. Completion:</span>
                    <div className="font-medium">{formatDate(progress.estimatedCompletionAt)}</div>
                  </div>
                </div>

                {progress.completedAt && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Completed At:</span>
                    <div className="font-medium text-green-600">{formatDate(progress.completedAt)}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
