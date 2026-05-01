export interface AppUser {
  id: string;
  email: string;
  name?: string;
  currency: string; // 'EUR' por defecto
  createdAt: string;
}