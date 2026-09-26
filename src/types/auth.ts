import type { UserRole } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | 'admin';
  designation?: string;
  phone?: string;
}

export interface AuthSession {
  access_token: string;
  profile?: AuthUser | null;
}
