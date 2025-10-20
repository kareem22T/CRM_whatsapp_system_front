"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Edit, Trash2, Play, Pause, Square, RotateCcw, Loader2, Eye, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Campaign } from "@/types/campaign"
import { useAppSelector } from "@/app/hooks"

interface CampaignTableProps {
  campaigns: Campaign[]
  loading: boolean
  onEdit: (campaign: Campaign) => void
  onDelete: (campaignId: number) => void
  onRefresh?: () => void
  onViewProgress?: (campaign: Campaign) => void
  onViewJobs?: (campaign: Campaign) => void
}

export function CampaignTable({
  campaigns,
  loading,
  onEdit,
  onDelete,
  onRefresh,
  onViewProgress,
  onViewJobs,
}: CampaignTableProps) {
  const [actioningCampaigns, setActioningCampaigns] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  const token = useAppSelector((state) => state.auth.token)

  const handleCampaignAction = async (campaignId: number, action: "start" | "pause" | "resume" | "cancel") => {
    try {
      setActioningCampaigns((prev) => new Set(prev).add(campaignId))

      const endpoint =
        action === "start"
          ? `http://67.211.221.109:3002/campaign/${campaignId}/start`
          : `http://67.211.221.109:3002/campaign/${campaignId}/${action}`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || `Campaign ${action}ed successfully`,
        })
        if (onRefresh) {
          onRefresh()
        }
      } else {
        toast({
          title: "Error",
          description: data.message || `Failed to ${action} campaign`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} campaign`,
        variant: "destructive",
      })
    } finally {
      setActioningCampaigns((prev) => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      inactive: { variant: "secondary" as const, label: "Inactive" },
      active: { variant: "default" as const, label: "Active" },
      running: { variant: "default" as const, label: "Running" },
      paused: { variant: "outline" as const, label: "Paused" },
      completed: { variant: "secondary" as const, label: "Completed" },
      failed: { variant: "destructive" as const, label: "Failed" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getActionButtons = (campaign: Campaign) => {
    const isActioning = actioningCampaigns.has(campaign.id)
    const buttons = []

    switch (campaign.status) {
      case "inactive":
        buttons.push(
          <Button
            key="start"
            variant="outline"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, "start")}
            disabled={isActioning}
          >
            {isActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          </Button>,
        )
        break
      case "running":
        buttons.push(
          <Button
            key="pause"
            variant="outline"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, "pause")}
            disabled={isActioning}
          >
            {isActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pause className="h-4 w-4" />}
          </Button>,
        )
        buttons.push(
          <Button
            key="cancel"
            variant="outline"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, "cancel")}
            disabled={isActioning}
          >
            {isActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
          </Button>,
        )
        break
      case "paused":
        buttons.push(
          <Button
            key="resume"
            variant="outline"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, "resume")}
            disabled={isActioning}
          >
            {isActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          </Button>,
        )
        buttons.push(
          <Button
            key="cancel"
            variant="outline"
            size="sm"
            onClick={() => handleCampaignAction(campaign.id, "cancel")}
            disabled={isActioning}
          >
            {isActioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
          </Button>,
        )
        break
    }

    // View progress and jobs buttons for active campaigns
    if (["running", "paused", "completed"].includes(campaign.status)) {
      buttons.push(
        <Button key="progress" variant="outline" size="sm" onClick={() => onViewProgress?.(campaign)}>
          <Eye className="h-4 w-4" />
        </Button>,
      )
      buttons.push(
        <Button key="jobs" variant="outline" size="sm" onClick={() => onViewJobs?.(campaign)}>
          <BarChart3 className="h-4 w-4" />
        </Button>,
      )
    }

    // Edit button for inactive campaigns only
    if (campaign.status === "inactive") {
      buttons.push(
        <Button key="edit" variant="outline" size="sm" onClick={() => onEdit(campaign)}>
          <Edit className="h-4 w-4" />
        </Button>,
      )
    }

    return buttons
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Contacts</TableHead>
            <TableHead>Messages</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No campaigns found
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell className="max-w-xs truncate">{campaign.description}</TableCell>
                <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={campaign.progressPercentage} className="w-20" />
                    <div className="text-xs text-muted-foreground">{campaign.progressPercentage}%</div>
                  </div>
                </TableCell>
                <TableCell>
                  {campaign.session ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{campaign.session.sessionName}</span>
                      <span className="text-xs text-muted-foreground">{campaign.session.agentName}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No session</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {campaign.totalContacts} total
                    {campaign.contactGroup && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        {campaign.contactGroup.color && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: campaign.contactGroup.color }}
                          />
                        )}
                        {campaign.contactGroup.name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div className="text-green-600">✓ {campaign.messagesSent}</div>
                    <div className="text-yellow-600">⏳ {campaign.messagesPending}</div>
                    {campaign.messagesFailed > 0 && <div className="text-red-600">✗ {campaign.messagesFailed}</div>}
                  </div>
                </TableCell>
                <TableCell>
                  {campaign.status === "running" && campaign.startedAt && (
                    <div className="text-sm">
                      <div>Started</div>
                      <div className="text-xs text-muted-foreground">{formatDate(campaign.startedAt)}</div>
                    </div>
                  )}
                  {campaign.status === "paused" && campaign.pausedAt && (
                    <div className="text-sm">
                      <div>Paused</div>
                      <div className="text-xs text-muted-foreground">{formatDate(campaign.pausedAt)}</div>
                    </div>
                  )}
                  {campaign.status === "completed" && campaign.completedAt && (
                    <div className="text-sm">
                      <div>Completed</div>
                      <div className="text-xs text-muted-foreground">{formatDate(campaign.completedAt)}</div>
                    </div>
                  )}
                  {campaign.status === "inactive" && (
                    <div className="text-sm">
                      <div>Created</div>
                      <div className="text-xs text-muted-foreground">{formatDate(campaign.createdAt)}</div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getActionButtons(campaign)}
                    <Button variant="outline" size="sm" onClick={() => onDelete(campaign.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
