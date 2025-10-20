"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, FolderOpen, Plus, Edit, Trash2, Users, MoreHorizontal, CheckCircle2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { ContactGroup } from "./contact-group-dialog"

interface ContactGroupSidebarProps {
  groups: ContactGroup[]
  selectedGroupId: number | null
  onGroupSelect: (groupId: number | null) => void
  onAddGroup: () => void
  onEditGroup: (group: ContactGroup) => void
  onDeleteGroup: (groupId: number) => void
  onStartGroupVerification: (group: ContactGroup) => void
  loading: boolean
}

export function ContactGroupSidebar({
  groups,
  selectedGroupId,
  onGroupSelect,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onStartGroupVerification,
  loading,
}: ContactGroupSidebarProps) {
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null)

  const handleDeleteConfirm = () => {
    if (deleteGroupId) {
      onDeleteGroup(deleteGroupId)
      setDeleteGroupId(null)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Contact Groups</CardTitle>
          <Button size="sm" onClick={onAddGroup}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* All Contacts Option */}
        <Button
          variant={selectedGroupId === null ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onGroupSelect(null)}
        >
          <Users className="h-4 w-4 mr-2" />
          All Contacts
          <Badge variant="secondary" className="ml-auto">
            {groups.reduce((total, group) => total + (group.contactCount || 0), 0)}
          </Badge>
        </Button>

        {/* Contact Groups */}
        <div className="space-y-1">
          {groups.map((group) => (
            <div key={group.id} className="flex items-center group">
              <Button
                variant={selectedGroupId === group.id ? "default" : "ghost"}
                className="flex-1 justify-start"
                onClick={() => onGroupSelect(group.id)}
              >
                {selectedGroupId === group.id ? (
                  <FolderOpen className="h-4 w-4 mr-2" style={{ color: group.color }} />
                ) : (
                  <Folder className="h-4 w-4 mr-2" style={{ color: group.color }} />
                )}
                <span className="truncate">{group.name}</span>
                {group.contactCount !== undefined && (
                  <Badge variant="secondary" className="ml-auto">
                    {group.contactCount}
                  </Badge>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStartGroupVerification(group)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Check WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEditGroup(group)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeleteGroupId(group.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {groups.length === 0 && !loading && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No contact groups yet.
            <br />
            Create one to organize your contacts.
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteGroupId !== null} onOpenChange={() => setDeleteGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact group? Contacts in this group will not be deleted, but they
              will be removed from the group. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
