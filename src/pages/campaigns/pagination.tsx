"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  onPageChange: (page: number) => void
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, totalItems, itemsPerPage, hasNextPage, hasPreviousPage } = pagination

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={!hasPreviousPage}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="text-sm">
          Page {currentPage} of {totalPages}
        </div>
        <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={!hasNextPage}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
