"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/app/hooks"
import type { Campaign, Job, JobStats } from "@/types/campaign"

interface CampaignJobsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
}

export function CampaignJobsDialog({ open, onOpenChange, campaign }: CampaignJobsDialogProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobStats, setJobStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [retryingJobs, setRetryingJobs] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  const token = useAppSelector((state) => state.auth.token)

  useEffect(() => {
    if (open && campaign) {
      fetchJobs()
      fetchJobStats()
    }
  }, [open, campaign, statusFilter])

  const fetchJobs = async () => {
    if (!campaign) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await fetch(`http://67.211.221.109:3002/campaign/${campaign.id}/jobs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setJobs(data.data.jobs)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch campaign jobs",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch campaign jobs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchJobStats = async () => {
    if (!campaign) return

    try {
      const response = await fetch(`http://67.211.221.109:3002/campaign/${campaign.id}/job-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (data.success) {
        setJobStats(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch job stats:", error)
    }
  }

  const handleRetryJob = async (jobId: number) => {
    try {
      setRetryingJobs((prev) => new Set(prev).add(jobId))

      const response = await fetch(`http://67.211.221.109:3002/campaign-job/${jobId}/retry`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Job retry initiated successfully",
        })
        fetchJobs()
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to retry job",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry job",
        variant: "destructive",
      })
    } finally {
      setRetryingJobs((prev) => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "Pending" },
      processing: { variant: "default" as const, label: "Processing" },
      completed: { variant: "secondary" as const, label: "Completed" },
      failed: { variant: "destructive" as const, label: "Failed" },
      cancelled: { variant: "secondary" as const, label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Campaign Jobs: {campaign?.name}
          </DialogTitle>
          <DialogDescription>View and manage individual message jobs for this campaign</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Statistics */}
          {jobStats && (
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
                <CardDescription>Overview of all jobs in this campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{jobStats.totalJobs}</div>
                    <div className="text-sm text-muted-foreground">Total Jobs</div>
                  </div>
                  {jobStats.statusBreakdown.map((stat) => (
                    <div key={stat.status} className="text-center">
                      <div className="text-2xl font-bold">{stat.count}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {stat.status}
                        {stat.avgDelay && ` (${stat.avgDelay}m avg)`}
                      </div>
                    </div>
                  ))}
                </div>

                {jobStats.nextScheduledJob && (
                  <div className="pt-4 border-t">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Next scheduled job:</span>
                      <div className="font-medium">
                        {jobStats.nextScheduledJob.contactPhone} at {formatDate(jobStats.nextScheduledJob.scheduledAt)}(
                        {jobStats.nextScheduledJob.delayMinutes}m delay)
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Filters and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={fetchJobs} variant="outline" size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Jobs Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Delay</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="font-medium">{job.contactPhone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">{job.templateMessage}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-sm">{formatDate(job.scheduledAt)}</TableCell>
                      <TableCell className="text-sm">{formatDate(job.processedAt)}</TableCell>
                      <TableCell className="text-sm">{job.delayMinutes}m</TableCell>
                      <TableCell className="text-sm">
                        {job.retryCount}/{job.maxRetries}
                      </TableCell>
                      <TableCell className="text-right">
                        {job.canRetry && job.status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetryJob(job.id)}
                            disabled={retryingJobs.has(job.id)}
                          >
                            {retryingJobs.has(job.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
