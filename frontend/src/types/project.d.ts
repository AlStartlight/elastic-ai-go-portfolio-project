export interface Project {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  image_url?: string;
  project_url?: string;
  github_url?: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  tech_stack: string[];
  image_url?: string;
  project_url?: string;
  github_url?: string;
  is_active: boolean;
  order: number;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  tech_stack?: string[];
  image_url?: string;
  project_url?: string;
  github_url?: string;
  is_active?: boolean;
  order?: number;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}