"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Play, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/app/hooks"

export interface Campaign {
  id: number
  name: string
  description: string
  minIntervalMinutes: number
  maxIntervalMinutes: number
  lastSent: string | null
  createdAt: string
  updatedAt: string
  sessionId: number
  isStarted?: boolean
  session?: {
    id: number
    sessionName: string
    agentName: string
    isActive: boolean
  }
  contacts?: Array<{
    id: number
    name: string
    email: string
    phone: string
  }>
  templates?: Array<{
    id: number
    name: string
    message: string
  }>
}

interface CampaignTableProps {
  campaigns: Campaign[]
  loading: boolean
  onEdit: (campaign: Campaign) => void
  onDelete: (campaignId: number) => void
  onRefresh?: () => void
}

export function CampaignTable({ campaigns, loading, onEdit, onDelete, onRefresh }: CampaignTableProps) {
  const [startingCampaigns, setStartingCampaigns] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  const token = useAppSelector((state) => state.auth.token)

  const handleStartCampaign = async (campaignId: number) => {
    try {
      setStartingCampaigns((prev) => new Set(prev).add(campaignId))

      const response = await fetch(`http://localhost:3002/start-campaign/${campaignId}`, {
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
          description: `Campaign started successfully with ${data.data.jobsScheduled} messages scheduled`,
        })
        window.location.reload()
        // Refresh the campaigns list to update the status
        if (onRefresh) {
          onRefresh()
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to start campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start campaign",
        variant: "destructive",
      })
    } finally {
      setStartingCampaigns((prev) => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    }
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
            <TableHead>Session</TableHead>
            <TableHead>Interval (min)</TableHead>
            <TableHead>Last Sent</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No campaigns found
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell className="max-w-xs truncate">{campaign.description}</TableCell>
                <TableCell>
                  <Badge variant={campaign.isStarted ? "default" : "secondary"}>
                    {campaign.isStarted ? "Started" : "Not Started"}
                  </Badge>
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
                  {campaign.minIntervalMinutes} - {campaign.maxIntervalMinutes}
                </TableCell>
                <TableCell>{campaign.lastSent ? formatDate(campaign.lastSent) : "Never"}</TableCell>
                <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!campaign.isStarted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartCampaign(campaign.id)}
                        disabled={startingCampaigns.has(campaign.id)}
                      >
                        {startingCampaigns.has(campaign.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        {startingCampaigns.has(campaign.id) ? "Starting..." : "Start"}
                      </Button>
                    )}
                    {
                        !campaign.isStarted && (                            
                            <Button variant="outline" size="sm" onClick={() => onEdit(campaign)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                        )
                    }
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
