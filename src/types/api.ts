export interface ApiErrorBody {
  error?: string;
  message?: string;
  code?: string;
}

export interface HealthResponse {
  ok: boolean;
  database?: string;
  databaseMessage?: string;
}

export interface DashboardSummary {
  teachers: number;
  students: number;
  batches: number;
}

export interface BackendAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    phone?: string;
    designation?: string;
    role?: string;
  };
}

export interface SignInResponse {
  session?: { access_token?: string };
  access_token?: string;
  user?: BackendAuthUser;
  profile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    designation?: string;
  };
}

export type BackendRow = Record<string, unknown>;
