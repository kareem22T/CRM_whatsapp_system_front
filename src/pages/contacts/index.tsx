"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactTable, type Contact } from "./contact-table"
import { ContactDialog } from "./contact-dialog"
import { ContactGroupSidebar } from "./contact-group-sidebar"
import { ContactGroupDialog, type ContactGroup } from "./contact-group-dialog"
import { Pagination } from "./pagination"
import { VerificationDialog } from "./verification-dialog"
import { Plus, Search, Users, Download, Upload } from "lucide-react"
import { useAppSelector } from "@/app/hooks"
import { toast, ToastContainer } from "react-toastify"
import { RootState } from "@/app/store"

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ContactsResponse {
  success: boolean
  message: string
  data: Contact[]
  pagination: PaginationInfo
}

export interface ContactGroupsResponse {
  success: boolean
  message: string
  data: ContactGroup[]
  pagination: PaginationInfo
}

export default function ContactsPage() {
  // State for contacts
  const [contacts, setContacts] = useState<Contact[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [companyFilter, setCompanyFilter] = useState("all")

  // State for contact groups
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [groupsLoading, setGroupsLoading] = useState(true)

  // Dialog states
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null)

  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)
  const [verificationType, setVerificationType] = useState<"group" | "contact">("contact")
  const [verificationTargetId, setVerificationTargetId] = useState<number>(0)
  const [verificationTargetName, setVerificationTargetName] = useState<string>("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const token = useAppSelector((state: RootState) => state.auth.token)

  // Fetch contacts
  const fetchContacts = async (page = 1, limit = 10, searchTerm = "", company = "", groupId: number | null = null) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(company && { company }),
        ...(groupId && { groupId: groupId.toString() }),
      })

      const response = await fetch(`http://67.211.221.109:3001/contacts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data: ContactsResponse = await response.json()

      if (data.success) {
        setContacts(data.data)
        setPagination(data.pagination)
      } else {
        toast.error("Failed to fetch contacts")
      }
    } catch (error) {
      toast.error("Failed to fetch contacts")
    } finally {
      setLoading(false)
    }
  }

  // Fetch contact groups
  const fetchContactGroups = async () => {
    try {
      setGroupsLoading(true)
      const response = await fetch("http://67.211.221.109:3001/contact-groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data: ContactGroupsResponse = await response.json()

      if (data.success) {
        setContactGroups(data.data)
      } else {
        toast.error("Failed to fetch contact groups")
      }
    } catch (error) {
      toast.error("Failed to fetch contact groups")
    } finally {
      setGroupsLoading(false)
    }
  }

  useEffect(() => {
    fetchContactGroups()
  }, [])

  useEffect(() => {
    fetchContacts(
      pagination.page,
      pagination.limit,
      search,
      companyFilter === "all" ? "" : companyFilter,
      selectedGroupId,
    )
  }, [pagination.page, pagination.limit, selectedGroupId, companyFilter])

  // Event handlers
  const handleSearch = () => {
    fetchContacts(1, pagination.limit, search, companyFilter === "all" ? "" : companyFilter, selectedGroupId)
  }

  const handleAddContact = () => {
    setEditingContact(null)
    setContactDialogOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setContactDialogOpen(true)
  }

  const handleDeleteContact = async (contactId: number) => {
    try {
      const response = await fetch(`http://67.211.221.109:3001/contacts/${contactId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Contact deleted successfully")
        fetchContacts(
          pagination.page,
          pagination.limit,
          search,
          companyFilter === "all" ? "" : companyFilter,
          selectedGroupId,
        )
      } else {
        toast.error("Failed to delete contact")
      }
    } catch (error) {
      toast("Failed to delete contact")
    }
  }

  const handleStartContactVerification = (contact: Contact) => {
    setVerificationType("contact")
    setVerificationTargetId(contact.id)
    setVerificationTargetName(contact.name)
    setVerificationDialogOpen(true)
  }

  const handleStartGroupVerification = (group: ContactGroup) => {
    setVerificationType("group")
    setVerificationTargetId(group.id)
    setVerificationTargetName(group.name)
    setVerificationDialogOpen(true)
  }

  const handleContactSaved = () => {
    window.location.reload()
  }

  const handleAddGroup = () => {
    setEditingGroup(null)
    setGroupDialogOpen(true)
  }

  const handleEditGroup = (group: ContactGroup) => {
    setEditingGroup(group)
    setGroupDialogOpen(true)
  }

  const handleDeleteGroup = async (groupId: number) => {
    try {
      const response = await fetch(`http://67.211.221.109:3001/contact-groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Contact group deleted successfully")
        fetchContactGroups()
        if (selectedGroupId === groupId) {
          setSelectedGroupId(null)
        }
      } else {
        toast.error("Failed to delete contact group")
      }
    } catch (error) {
      toast.error("Failed to delete contact group")
    }
  }

  const handleGroupSaved = () => {
    window.location.reload()
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const handleGroupSelect = (groupId: number | null) => {
    setSelectedGroupId(groupId)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch("http://67.211.221.109:3001/contacts/template", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "contacts-template.xlsx"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Template downloaded successfully")
      } else {
        toast.error("Failed to download template")
      }
    } catch (error) {
      toast.error("Failed to download template")
    }
  }

  const handleImportExcel = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("http://67.211.221.109:3001/contacts/import-excel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(`Successfully imported ${result.imported || 0} contacts`)
        // Refresh the contacts list
        fetchContacts(
          pagination.page,
          pagination.limit,
          search,
          companyFilter === "all" ? "" : companyFilter,
          selectedGroupId,
        )
      } else {
        toast.error(result.message || "Failed to import contacts")
      }
    } catch (error) {
      toast.error("Failed to import contacts")
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls")) {
        toast.error("Please select an Excel file (.xlsx or .xls)")
        return
      }

      handleImportExcel(file)
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  // Get unique companies for filter
  const companies = Array.from(new Set(contacts.map((c) => c.company).filter(Boolean)))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ContactGroupSidebar
            groups={contactGroups}
            selectedGroupId={selectedGroupId}
            onGroupSelect={handleGroupSelect}
            onAddGroup={handleAddGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onStartGroupVerification={handleStartGroupVerification}
            loading={groupsLoading}
          />
        </div>
        <ToastContainer />

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Contact Management
                  </CardTitle>
                  <CardDescription>
                    {selectedGroupId
                      ? `Contacts in ${contactGroups.find((g) => g.id === selectedGroupId)?.name || "Selected Group"}`
                      : "Manage your contacts and organize them into groups"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImportClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Excel
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileInputChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search contacts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All companies</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company!}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} variant="outline">
                  Search
                </Button>
                <Button onClick={handleAddContact}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              {/* Contacts Table */}
              <ContactTable
                contacts={contacts}
                loading={loading}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onStartVerification={handleStartContactVerification}
              />

              {/* Pagination */}
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Dialog */}
      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contact={editingContact}
        onContactSaved={handleContactSaved}
        availableGroups={contactGroups}
      />

      {/* Contact Group Dialog */}
      <ContactGroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        group={editingGroup}
        onGroupSaved={handleGroupSaved}
      />

      <VerificationDialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
        type={verificationType}
        targetId={verificationTargetId}
        targetName={verificationTargetName}
        onVerificationStarted={() => {
          // Refresh contacts to show updated verification status
          fetchContacts(
            pagination.page,
            pagination.limit,
            search,
            companyFilter === "all" ? "" : companyFilter,
            selectedGroupId,
          )
        }}
      />
    </div>
  )
}
