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
import { useToast } from "@/hooks/use-toast"
import type { Template } from "./index"
import { useAppSelector } from "@/app/hooks"
import { X, ImageIcon } from "lucide-react"

interface TemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: Template | null
  onTemplateSaved: () => void
}

export function TemplateDialog({ open, onOpenChange, template, onTemplateSaved }: TemplateDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    message: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const token = useAppSelector((state) => state.auth.token)

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        message: template.message,
      })
      if (template.hasImage) {
        loadTemplateImage(template.id)
      }
    } else {
      setFormData({
        name: "",
        message: "",
      })
      setImagePreview(null)
      setSelectedImage(null)
    }
  }, [template, open])

  const loadTemplateImage = async (templateId: number) => {
    try {
      const response = await fetch(`http://67.211.221.109:3001/templates/${templateId}/image`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setImagePreview(url)
      }
    } catch (error) {
      console.error("Failed to load template image:", error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = template ? `http://67.211.221.109:3001/templates/${template.id}` : "http://67.211.221.109:3001/templates"
      const method = template ? "PUT" : "POST"

      const data = new FormData()
      data.append("name", formData.name)
      data.append("message", formData.message)
      if (selectedImage) {
        data.append("image", selectedImage)
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: template ? "Template updated successfully" : "Template created successfully",
        })
        onTemplateSaved()
      } else {
        toast({
          title: "Error",
          description: template ? "Failed to update template" : "Failed to create template",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Add New Template"}</DialogTitle>
          <DialogDescription>
            {template ? "Update template information" : "Create a new message template"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter template name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Enter template message"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Template Image (Optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-40 mx-auto rounded" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="w-full bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP up to 5MB</p>
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("image")?.click()}
                    className="w-full"
                  >
                    Choose Image
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : template ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
