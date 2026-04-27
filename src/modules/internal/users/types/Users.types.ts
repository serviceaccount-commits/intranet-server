import { Client } from '../../../external/knowledgeBase/entities/Client.entity';
import { Assignment } from '../entities/Assignment.entity';
import { Role } from '../entities/Role.entity';

export interface PublicUserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  work_email: string;
  work_phone: string;
  role: Role | null;
  assignments: Assignment[];
  reports_to_id: string;
  reports_to_first_name: string;
  reports_to_last_name: string;
  job_title: string;
}

export interface PrivateUserProfile {
  personal_email: string;
  personal_phone: string;
  residential_country: string;
  country_nationality: string;
  clients: Client[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  hire_date: Date;
  selectable_as_leader: boolean;
  last_activity_at: Date | null;
}

export interface CompleteUserProfile {
  public_profile: PublicUserProfile | null;
  private_profile: PrivateUserProfile | null;
  reporting_user_count: number;
}

export interface SmallUser {
  user_id: string;
  first_name: string;
  last_name: string;
}
