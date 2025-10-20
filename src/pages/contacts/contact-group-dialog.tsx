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
import { useAppSelector } from "@/app/hooks"
import { toast } from "react-toastify"
import { RootState } from "@/app/store"

export interface ContactGroup {
  id: number
  name: string
  description?: string
  color?: string
  isActive: boolean
  contactCount?: number
  createdAt: string
  updatedAt: string
}

interface ContactGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: ContactGroup | null
  onGroupSaved: () => void
}

const colorOptions = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Yellow" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Orange" },
  { value: "#84cc16", label: "Lime" },
]

export function ContactGroupDialog({ open, onOpenChange, group, onGroupSaved }: ContactGroupDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  })
  const [loading, setLoading] = useState(false)
  const token = useAppSelector((state: RootState) => state.auth.token)

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description || "",
        color: group.color || "#3b82f6",
      })
    } else {
      setFormData({
        name: "",
        description: "",
        color: "#3b82f6",
      })
    }
  }, [group, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = group ? `http://67.211.221.109:3001/contact-groups/${group.id}` : "http://67.211.221.109:3001/contact-groups"
      const method = group ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add when auth is available
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(group ? "Contact group updated successfully" : "Contact group created successfully")
        onGroupSaved()
      } else {
        const errorData = await response.json().catch(() => null) // try parsing error
        toast.error(errorData?.message || "Failed to update contact group")
        console.log(errorData || response)
      }
    } catch (error: any) {
      toast.error(error.data.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{group ? "Edit Contact Group" : "Create New Contact Group"}</DialogTitle>
          <DialogDescription>
            {group ? "Update contact group information" : "Create a new folder to organize your contacts"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Clients, Suppliers, Team"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of this contact group"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? "border-foreground" : "border-muted"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                  title={color.label}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : group ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
