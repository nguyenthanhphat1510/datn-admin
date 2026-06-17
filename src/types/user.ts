export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  email: string;
  fullName?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
