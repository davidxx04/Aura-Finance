import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../core/services/supabase.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState<AuthState>({
    user: null,
    loading: false,
    error: null,
  }),

  withComputed(({ user }) => ({
    isLoggedIn: computed(() => !!user()),
    userEmail: computed(() => user()?.email ?? null),
  })),

  withMethods((store, supabase = inject(SupabaseService), router = inject(Router)) => ({

    async init(): Promise<void> {
      const user = await supabase.getUser();
      patchState(store, { user });

      supabase.onAuthStateChange(async (_event, session) => {
        patchState(store, { user: session?.user ?? null });
      });
    },

    async signUp(email: string, password: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      const { error } = await supabase.signUp(email, password);
      if (error) {
        patchState(store, { loading: false, error: error.message });
        return;
      }
      patchState(store, { loading: false });
    },

    async signIn(email: string, password: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      const { data, error } = await supabase.signIn(email, password);
      if (error) {
        patchState(store, { loading: false, error: error.message });
        return;
      }
      patchState(store, { user: data.user, loading: false });
      router.navigate(['/app/dashboard']);
    },

    async signOut(): Promise<void> {
      await supabase.signOut();
      patchState(store, { user: null });
      router.navigate(['/']);
    },

    clearError(): void {
      patchState(store, { error: null });
    },

  }))
);