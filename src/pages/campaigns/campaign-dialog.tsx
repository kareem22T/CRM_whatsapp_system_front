"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Search, X } from "lucide-react"
import { useAppSelector } from "@/app/hooks"

// import type { Campaign } from "@/types/campaign"
// import { useAppSelector } from "@/app/hooks"

interface Campaign {
  id: number
  name: string
  description: string
  minIntervalMinutes: number
  maxIntervalMinutes: number
  lastSent: string | null
  createdAt: string
  updatedAt: string
  sessionId: number
  groupId?: number
  status: "inactive" | "active" | "running" | "paused" | "completed" | "failed"
  isStarted?: boolean
  totalContacts: number
  messagesSent: number
  messagesFailed: number
  messagesPending: number
  progressPercentage: number
  nextSendAt: string | null
  startedAt: string | null
  completedAt: string | null
  pausedAt: string | null
  estimatedCompletionAt: string | null
  isAllDay?: boolean
  dailyStartTime?: string | null
  dailyEndTime?: string | null
  session?: {
    id: number
    sessionName: string
    agentName: string
    isActive: boolean
    lastConnected?: string
    connectionStatus?: string
  }
  contactGroup?: {
    id: number
    name: string
    description: string | null
    color: string | null
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

interface Session {
  id: number
  sessionName: string
  agentName: string
  isActive: boolean
}

interface Template {
  id: number
  name: string
  message: string
}

interface ContactGroup {
  id: number
  name: string
  description: string | null
  color: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  contactCount: number
}

interface ContactGroupsResponse {
  success: boolean
  data: ContactGroup[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface CampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
  onCampaignSaved: () => void
}

export function CampaignDialog({ open, onOpenChange, campaign, onCampaignSaved }: CampaignDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sessionId: "",
    minIntervalMinutes: 5,
    maxIntervalMinutes: 10,
    groupId: null as number | null,
    templateIds: [] as number[],
    isAllDay: true,
    dailyStartTime: null as string | null,
    dailyEndTime: null as string | null,
  })

  const [sessions, setSessions] = useState<Session[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([])
  const [contactGroupSearch, setContactGroupSearch] = useState("")
  const [contactGroupPage, setContactGroupPage] = useState(1)
  const [contactGroupPagination, setContactGroupPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
  })

  const [filteredSessions, setFilteredSessions] = useState<Session[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [sessionSearch, setSessionSearch] = useState("")
  const [templateSearch, setTemplateSearch] = useState("")

  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const token = useAppSelector((state) => state.auth.token)

  useEffect(() => {
    if (open) {
      fetchSessions()
      fetchTemplates()
      fetchContactGroups(1, contactGroupSearch)
    }
  }, [open])

  useEffect(() => {
    const filtered = sessions.filter(
      (session) =>
        session.sessionName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        session.agentName.toLowerCase().includes(sessionSearch.toLowerCase()),
    )
    setFilteredSessions(filtered)
  }, [sessions, sessionSearch])

  useEffect(() => {
    const filtered = templates.filter((template) => template.name.toLowerCase().includes(templateSearch.toLowerCase()))
    setFilteredTemplates(filtered)
  }, [templates, templateSearch])

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description,
        sessionId: campaign.sessionId.toString(),
        minIntervalMinutes: campaign.minIntervalMinutes,
        maxIntervalMinutes: campaign.maxIntervalMinutes,
        groupId: campaign.groupId || null,
        templateIds: campaign.templates?.map((t) => t.id) || [],
        isAllDay: campaign.isAllDay !== undefined ? campaign.isAllDay : true,
        dailyStartTime: campaign.dailyStartTime || null,
        dailyEndTime: campaign.dailyEndTime || null,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        sessionId: "",
        minIntervalMinutes: 5,
        maxIntervalMinutes: 10,
        groupId: null,
        templateIds: [],
        isAllDay: true,
        dailyStartTime: null,
        dailyEndTime: null,
      })
    }
  }, [campaign, open])

  const fetchSessions = async () => {
    try {
      const response = await fetch("http://67.211.221.109:3001/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setSessions(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch("http://67.211.221.109:3001/templates", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setTemplates(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error)
    }
  }

  const fetchContactGroups = async (page = 1, search = "") => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      })

      const response = await fetch(`http://67.211.221.109:3001/contact-groups?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data: ContactGroupsResponse = await response.json()
      if (data.success) {
        if (page === 1) {
          setContactGroups(data.data)
        } else {
          setContactGroups((prev) => [...prev, ...data.data])
        }
        setContactGroupPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch contact groups:", error)
    }
  }

  const handleContactGroupSearch = () => {
    setContactGroupPage(1)
    fetchContactGroups(1, contactGroupSearch)
  }

  const loadMoreContactGroups = () => {
    if (contactGroupPagination.hasNextPage) {
      const nextPage = contactGroupPage + 1
      setContactGroupPage(nextPage)
      fetchContactGroups(nextPage, contactGroupSearch)
    }
  }

  const selectContactGroup = (contactGroupId: number) => {
    setFormData((prev) => ({
      ...prev,
      groupId: prev.groupId === contactGroupId ? null : contactGroupId,
    }))
  }

  const toggleTemplate = (templateId: number) => {
    setFormData((prev) => ({
      ...prev,
      templateIds: prev.templateIds.includes(templateId)
        ? prev.templateIds.filter((id) => id !== templateId)
        : [...prev.templateIds, templateId],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = campaign ? `http://67.211.221.109:3001/campaigns/${campaign.id}` : "http://67.211.221.109:3001/campaigns"
      const method = campaign ? "PUT" : "POST"

      const formatTimeToHHMMSS = (timeValue: string | null): string | null => {
        if (!timeValue) return null
        // If time is in HH:MM format, add :00 for seconds
        return timeValue.includes(":") && timeValue.split(":").length === 2 ? `${timeValue}:00` : timeValue
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        sessionId: Number.parseInt(formData.sessionId),
        minIntervalMinutes: formData.minIntervalMinutes,
        maxIntervalMinutes: formData.maxIntervalMinutes,
        groupId: formData.groupId,
        templateIds: formData.templateIds,
        isAllDay: formData.isAllDay !== undefined ? formData.isAllDay : true,
        dailyStartTime: formatTimeToHHMMSS(formData.dailyStartTime),
        dailyEndTime: formatTimeToHHMMSS(formData.dailyEndTime),
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: campaign ? "Campaign updated successfully" : "Campaign created successfully",
        })
        onCampaignSaved()
      } else {
        toast({
          title: "Error",
          description: campaign ? "Failed to update campaign" : "Failed to create campaign",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit Campaign" : "Add New Campaign"}</DialogTitle>
          <DialogDescription>
            {campaign ? "Update campaign information" : "Create a new marketing campaign"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Search sessions..."
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                />
                <Select
                  value={formData.sessionId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, sessionId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id.toString()}>
                        {session.agentName} - {session.sessionName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minInterval">Min Interval (minutes)</Label>
              <Input
                id="minInterval"
                type="number"
                min="1"
                value={formData.minIntervalMinutes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, minIntervalMinutes: Number.parseInt(e.target.value) }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxInterval">Max Interval (minutes)</Label>
              <Input
                id="maxInterval"
                type="number"
                min="1"
                value={formData.maxIntervalMinutes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, maxIntervalMinutes: Number.parseInt(e.target.value) }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Campaign Schedule</Label>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAllDay"
                  checked={formData.isAllDay}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isAllDay: checked,
                      dailyStartTime: checked ? null : prev.dailyStartTime,
                      dailyEndTime: checked ? null : prev.dailyEndTime,
                    }))
                  }
                />
                <Label htmlFor="isAllDay">Run all day</Label>
              </div>

              {!formData.isAllDay && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="dailyStartTime">Daily Start Time</Label>
                    <Input
                      id="dailyStartTime"
                      type="time"
                      value={formData.dailyStartTime || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dailyStartTime: e.target.value || null,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyEndTime">Daily End Time</Label>
                    <Input
                      id="dailyEndTime"
                      type="time"
                      value={formData.dailyEndTime || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dailyEndTime: e.target.value || null,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Templates</Label>
            <Input
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
            />
            <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No templates found</p>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`template-${template.id}`}
                        checked={formData.templateIds.includes(template.id)}
                        onChange={() => toggleTemplate(template.id)}
                      />
                      <label htmlFor={`template-${template.id}`} className="text-sm">
                        {template.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {formData.templateIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.templateIds.map((templateId) => {
                  const template = templates.find((t) => t.id === templateId)
                  return template ? (
                    <Badge key={templateId} variant="secondary" className="text-xs">
                      {template.name}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => toggleTemplate(templateId)} />
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Contact Group</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search contact groups..."
                value={contactGroupSearch}
                onChange={(e) => setContactGroupSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleContactGroupSearch()}
              />
              <Button type="button" onClick={handleContactGroupSearch} variant="outline" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
              {contactGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contact groups found</p>
              ) : (
                <div className="space-y-2">
                  {contactGroups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`group-${group.id}`}
                        name="contactGroup"
                        checked={formData.groupId === group.id}
                        onChange={() => selectContactGroup(group.id)}
                      />
                      <label htmlFor={`group-${group.id}`} className="text-sm flex-1">
                        <div className="flex items-center gap-2">
                          {group.color && (
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                          )}
                          <span className="font-medium">{group.name}</span>
                          <span className="text-muted-foreground">({group.contactCount} contacts)</span>
                        </div>
                        {group.description && (
                          <div className="text-xs text-muted-foreground mt-1">{group.description}</div>
                        )}
                      </label>
                    </div>
                  ))}
                  {contactGroupPagination.hasNextPage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadMoreContactGroups}
                      className="w-full bg-transparent"
                    >
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </div>
            {formData.groupId && (
              <div className="flex flex-wrap gap-1">
                {(() => {
                  const selectedGroup = contactGroups.find((g) => g.id === formData.groupId)
                  return selectedGroup ? (
                    <Badge key={selectedGroup.id} variant="secondary" className="text-xs">
                      <div className="flex items-center gap-1">
                        {selectedGroup.color && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedGroup.color }} />
                        )}
                        {selectedGroup.name} ({selectedGroup.contactCount} contacts)
                      </div>
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setFormData((prev) => ({ ...prev, groupId: null }))}
                      />
                    </Badge>
                  ) : null
                })()}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : campaign ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
