export type EventLifecycleStage = 'upcoming' | 'stop' | 'completed';
export type EventMode = 'individual' | 'team';

export interface EventItem {
  id: number;
  title: string;
  description: string;
  event_date: string;
  venue: string;
  status?: string;
  registration_open?: boolean;
  certificate_enabled?: boolean;
  created_at?: string;
  lifecycle_stage: EventLifecycleStage;
  poster_url?: string | null;
  payment_qr_url?: string | null;
  event_mode: EventMode;
  team_size?: number | null;
  registration_fee?: number | null;
}

export interface UpdateItem {
  id: number;
  title: string;
  content?: string;
  description?: string;
  created_at: string;
}

export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  github_url?: string | null;
  demo_url?: string | null;
  created_at?: string;
}

export interface PaperItem {
  id?: number | string;
  title: string;
  summary: string;
  author: string;
  link?: string | null;
  created_at?: string;
}

export interface ResourceItem {
  id: number;
  title: string;
  type: string;
  url?: string | null;
  description?: string | null;
  created_at?: string;
}

export interface CommitteeMember {
  id: number;
  name: string;
  role: string;
  bio?: string | null;
  image_url?: string | null;
  linkedin?: string | null;
  display_order?: number;
  created_at?: string;
}

export interface RegistrationItem {
  id: string | number;
  event_id: number;
  leader_name: string;
  leader_usn: string;
  leader_branch: string;
  leader_year: string;
  leader_email: string;
  leader_phone: string;
  team_member_names?: string[];
  team_member_usns?: string[];
  is_paid_event: boolean;
  amount?: number | null;
  utr_number?: string | null;
  payment_status?: string;
  created_at?: string;
}

export interface ContactMessageItem {
  id: number;
  name: string;
  email: string;
  affiliation?: string;
  inquiry_type?: string;
  message: string;
  created_at?: string;
}

