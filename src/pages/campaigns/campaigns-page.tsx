"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CampaignTable } from "./campaign-table"
import { CampaignDialog } from "./campaign-dialog"
import { Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Campaign } from "@/types/campaign"
import { useAppSelector } from "@/app/hooks"
import { CampaignProgressDialog } from "./campaign-progress-dialog"
import { CampaignJobsDialog } from "./campaign-jobs-dialog"

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface CampaignsResponse {
  success: boolean
  message: string
  data: Campaign[]
  pagination: PaginationInfo
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const token = useAppSelector((state) => state.auth.token)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [jobsDialogOpen, setJobsDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const { toast } = useToast()

  const fetchCampaigns = async (page = 1, limit = 10, searchTerm = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`http://67.211.221.109:3001/campaigns?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data: CampaignsResponse = await response.json()

      if (data.success) {
        setCampaigns(data.data)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch campaigns",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns(pagination.currentPage, pagination.itemsPerPage, search)
  }, [pagination.currentPage, pagination.itemsPerPage])

  const handleSearch = () => {
    fetchCampaigns(1, pagination.itemsPerPage, search)
  }

  const handleAddCampaign = () => {
    setEditingCampaign(null)
    setDialogOpen(true)
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setDialogOpen(true)
  }

  const handleViewProgress = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setProgressDialogOpen(true)
  }

  const handleViewJobs = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setJobsDialogOpen(true)
  }


  const handleDeleteCampaign = async (campaignId: number) => {
    try {
      const response = await fetch(`http://67.211.221.109:3001/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        })
        fetchCampaigns(pagination.currentPage, pagination.itemsPerPage, search)
      } else {
        toast({
          title: "Error",
          description: "Failed to delete campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      })
    }
  }

  const handleCampaignSaved = () => {
    setDialogOpen(false)
    fetchCampaigns(pagination.currentPage, pagination.itemsPerPage, search)
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Campaign Management</CardTitle>
          <CardDescription>
            Manage marketing campaigns with real-time progress tracking and job monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
            <Button onClick={handleAddCampaign}>
              <Plus className="h-4 w-4 mr-2" />
              Add Campaign
            </Button>
          </div>

          {/* Campaigns Table */}
          <CampaignTable
            campaigns={campaigns}
            loading={loading}
            onEdit={handleEditCampaign}
            onDelete={handleDeleteCampaign}
            onViewJobs={handleViewJobs}
            onViewProgress={handleViewProgress}
            onRefresh={() => fetchCampaigns(pagination.currentPage, pagination.itemsPerPage, search)}
          />

          {/* Simple Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {campaigns.length} of {pagination.totalItems} campaigns
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Dialog */}
      <CampaignDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaign={editingCampaign}
        onCampaignSaved={handleCampaignSaved}
      />

      {/* Progress Dialog */}
      <CampaignProgressDialog
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        campaign={selectedCampaign}
      />

      {/* Jobs Dialog */}
      <CampaignJobsDialog open={jobsDialogOpen} onOpenChange={setJobsDialogOpen} campaign={selectedCampaign} />

    </div>
  )
}
