"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit, Trash2, Loader2, Phone, Mail, Building, User } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export interface Contact {
  id: number
  name: string
  email?: string
  phone: string
  company?: string
  position?: string
  notes?: string
  avatar?: string
  isActive: boolean
  groups?: Array<{
    id: number
    name: string
    color?: string
  }>
  createdAt: string
  updatedAt: string
}

interface ContactTableProps {
  contacts: Contact[]
  loading: boolean
  onEdit: (contact: Contact) => void
  onDelete: (contactId: number) => void
}

export function ContactTable({ contacts, loading, onEdit, onDelete }: ContactTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No contacts found</h3>
        <p className="text-muted-foreground">Get started by adding your first contact.</p>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                  <AvatarFallback className="text-xs">{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{contact.name}</div>
                  {contact.position && <div className="text-sm text-muted-foreground">{contact.position}</div>}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {contact.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                      {contact.email}
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                    {contact.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {contact.company && (
                  <div className="flex items-center text-sm">
                    <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                    {contact.company}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {contact.groups?.map((group) => (
                    <Badge
                      key={group.id}
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: group.color ? `${group.color}20` : undefined,
                        borderColor: group.color || undefined,
                      }}
                    >
                      {group.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {contact.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(contact.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
