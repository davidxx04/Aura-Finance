import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private platformId = inject(PLATFORM_ID);
  private supabase: SupabaseClient | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    }
  }

  async getSession(): Promise<Session | null> {
    if (!this.supabase) return null;
    const { data, error } = await this.supabase.auth.getSession();
    if (error) return null;
    return data.session;
  }

  async getUser(): Promise<User | null> {
    if (!this.supabase) return null;
    const session = await this.getSession();
    return session?.user ?? null;
  }

  async signUp(email: string, password: string) {
    if (!this.supabase) return { data: null, error: new Error('Not in browser') };
    return this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    if (!this.supabase) return { data: null, error: new Error('Not in browser') };
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut(): Promise<void> {
    if (!this.supabase) return;
    await this.supabase.auth.signOut();
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (!this.supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return this.supabase.auth.onAuthStateChange(callback);
  }
}