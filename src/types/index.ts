export interface User {
  id: number;
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MissingPerson {
  id: number;
  reporter_id: number;
  full_name: string;
  age?: number;
  gender: 'male' | 'female' | 'other';
  last_seen_location: string;
  last_seen_date: string;
  last_seen_time?: string;
  height?: string;
  weight?: string;
  hair_color?: string;
  eye_color?: string;
  skin_tone?: string;
  distinctive_features?: string;
  clothing_description?: string;
  medical_conditions?: string;
  photo_url?: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  additional_info?: string;
  status: 'missing' | 'found' | 'investigation' | 'closed';
  found_date?: Date | null;
  found_location?: string;
  found_by?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  case_number: string;
  created_at: Date;
  updated_at: Date;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  days_missing?: number;
}

export interface StatusUpdate {
  id: number;
  missing_person_id: number;
  user_id: number;
  old_status: 'missing' | 'found' | 'investigation' | 'closed';
  new_status: 'missing' | 'found' | 'investigation' | 'closed';
  update_note?: string;
  created_at: Date;
}

export interface Comment {
  id: number;
  missing_person_id: number;
  user_id: number;
  comment: string;
  is_anonymous: boolean;
  created_at: Date;
  user_name?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  missing_person_id?: number;
  title: string;
  message: string;
  type: 'status_update' | 'comment' | 'found' | 'general';
  is_read: boolean;
  created_at: Date;
}

export interface Statistics {
  total_cases: number;
  active_missing: number;
  found_cases: number;
  under_investigation: number;
  closed_cases: number;
  critical_cases: number;
  high_priority_cases: number;
  avg_days_to_find: number;
}

export interface DashboardStats {
  statistics: Statistics;
  recentCases: MissingPerson[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  monthlyTrends: {
    month: string;
    missing: number;
    found: number;
  }[];
  ageDistribution: {
    age_group: string;
    count: number;
  }[];
  genderDistribution: {
    gender: string;
    count: number;
  }[];
  priorityDistribution: {
    priority: string;
    count: number;
  }[];
}

