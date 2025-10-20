"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TemplateTable } from "./template-table"
import { TemplateDialog } from "./template-dialog"
import { Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppSelector } from "@/app/hooks"

export interface Template {
  id: number
  name: string
  message: string
  hasImage?: boolean
  imageFilename?: string
  imageMimetype?: string
  imageSize?: number
  createdAt: string
  updatedAt: string
}

export interface TemplatesResponse {
  success: boolean
  message: string
  data: Template[]
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const { toast } = useToast()
  const token = useAppSelector((state) => state.auth.token)

  const fetchTemplates = async (searchTerm = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`http://67.211.221.109:3001/templates?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data: TemplatesResponse = await response.json()

      if (data.success) {
        setTemplates(data.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch templates",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch templates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates(search)
  }, [])

  const handleSearch = () => {
    fetchTemplates(search)
  }

  const handleAddTemplate = () => {
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      const response = await fetch(`http://67.211.221.109:3001/templates/${templateId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template deleted successfully",
        })
        fetchTemplates(search)
      } else {
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }
  }

  const handleTemplateSaved = () => {
    setDialogOpen(false)
    fetchTemplates(search)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Template Management</CardTitle>
          <CardDescription>Manage message templates for your application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Search
            </Button>
            <Button onClick={handleAddTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </div>

          <TemplateTable
            templates={templates}
            loading={loading}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
          />
        </CardContent>
      </Card>

      <TemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onTemplateSaved={handleTemplateSaved}
      />
    </div>
  )
}
