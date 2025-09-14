export interface Template {
  id: number
  name: string
  content: string
  category: string
  status: "active" | "inactive"
  language: string
  tags: string
  variables?: Record<string, string>
  usageCount?: number
  lastUsed?: string
  createdAt: string
  updatedAt: string
}

export interface TemplateVariable {
  name: string
  value: string
  required: boolean
}

export interface TemplateCategory {
  id: string
  name: string
  color: string
  count: number
}

export interface TemplateStats {
  total: number
  active: number
  inactive: number
  mostUsed: Template[]
  recentlyUsed: Template[]
}

export interface CreateTemplateRequest {
  name: string
  content: string
  category: string
  status: "active" | "inactive"
  language: string
}

export interface UpdateTemplateRequest {
  name?: string
  content?: string
  category?: string
  status?: "active" | "inactive"
  language?: string
  tags?: string[]
}

export interface UseTemplateRequest {
  variables: Record<string, string>
}

export interface PreviewTemplateRequest {
  variables: Record<string, string>
}

export interface BulkUpdateStatusRequest {
  templateIds: number[]
  status: "active" | "inactive"
}

export interface ImportTemplatesRequest {
  templates: CreateTemplateRequest[]
}

export interface ExportTemplatesRequest {
  templateIds: number[]
}
