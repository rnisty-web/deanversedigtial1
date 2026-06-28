export type UserRole =
  | "admin"
  | "founder"
  | "lead_web_designer"
  | "lead_developer"
  | "customer"
  | "client";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "lost";

export type ProjectStatus =
  | "draft"
  | "planning"
  | "in_progress"
  | "review"
  | "completed"
  | "on_hold"
  | "cancelled";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  roles?: UserRole[];
  company: string | null;
  phone: string | null;
  last_seen_at: string | null;
  activity_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  service_interest: string | null;
  budget: string | null;
  project_type: string | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  deadline: string | null;
  tech_stack: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioCaseStudy {
  challenge?: string;
  solution?: string;
  content?: string;
  results?: string[];
  testimonial?: {
    quote: string;
    client_name: string;
    client_company: string;
  };
}

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  tags: string[] | null;
  industry?: string | null;
  case_study?: PortfolioCaseStudy | null;
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  client_company: string | null;
  client_image: string | null;
  content: string;
  rating: number | null;
  project_id: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  project_id: string | null;
  sender_id: string;
  recipient_id: string;
  subject: string | null;
  content: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: string;
  project_id: string;
  uploaded_by: string;
  name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  project_id: string | null;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  line_items: InvoiceLineItem[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Analytics {
  id: string;
  event_type: string;
  page_path: string | null;
  metadata: Record<string, unknown> | null;
  user_id: string | null;
  session_id: string | null;
  created_at: string;
}

export interface Settings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface Client {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
