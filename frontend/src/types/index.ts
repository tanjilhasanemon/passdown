export type MaterialType = "slides" | "notes" | "past_paper" | "book" | "other";
export type ContributionStatus = "pending" | "approved" | "rejected";
export type ModerationStatus = "approved" | "rejected";
export type RequestStatus = "open" | "fulfilled";
export type UserRole = "student" | "admin";

export type SecurityScope =
  | "profile:read"
  | "profile:write"
  | "contributions:write"
  | "requests:write"
  | "courses:write"
  | "materials:write"
  | "contributions:moderate"
  | "stats:read"
  | "users:manage";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfileUpdatePayload {
  name: string;
}

export interface UserPasswordUpdatePayload {
  current_password: string;
  new_password: string;
}

export interface ContributionStatusCounts {
  pending: number;
  approved: number;
  rejected: number;
}

export interface RequestStatusCounts {
  open: number;
  fulfilled: number;
}

export interface UserSummary {
  contributions: ContributionStatusCounts;
  requests: RequestStatusCounts;
}

export interface PlatformStats {
  users: number;
  courses: number;
  core_materials: number;
  contributions: ContributionStatusCounts;
  requests: RequestStatusCounts;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  department: string | null;
  semester_offered: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoursePayload {
  code: string;
  title: string;
  department?: string | null;
  semester_offered?: string | null;
}

export interface CoreMaterial {
  id: number;
  course_id: number;
  title: string;
  type: MaterialType;
  url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoreMaterialPayload {
  title: string;
  type: MaterialType;
  url: string;
  description?: string | null;
}

export interface Contribution {
  id: number;
  course_id: number;
  course_code?: string | null;
  course_title?: string | null;
  author_id?: number | null;
  author_name: string;
  title: string;
  type: MaterialType;
  url: string;
  description: string | null;
  status: ContributionStatus;
  created_at: string;
  updated_at: string;
}

export interface ContributionCreatePayload {
  author_name?: string;
  title: string;
  type: MaterialType;
  url: string;
  description?: string | null;
}

export interface ContributionUpdatePayload {
  author_name?: string;
  title: string;
  type: MaterialType;
  url: string;
  description?: string | null;
}

export interface MaterialRequest {
  id: number;
  course_id: number | null;
  course_code?: string | null;
  course_title?: string | null;
  author_id?: number | null;
  author_name: string;
  title: string;
  description: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface MaterialRequestCreatePayload {
  course_id?: number | null;
  author_name?: string;
  title: string;
  description?: string | null;
}

export interface MaterialRequestUpdatePayload {
  author_name?: string;
  title: string;
  description?: string | null;
}

export const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: "slides", label: "Lecture Slides" },
  { value: "notes", label: "Handwritten / Typed Notes" },
  { value: "past_paper", label: "Past Paper / Exam" },
  { value: "book", label: "Reference Book" },
  { value: "other", label: "Other Resource" },
];
