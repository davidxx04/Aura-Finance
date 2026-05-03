import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../core/services/supabase.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },

  withState<AuthState>({
    user: null,
    loading: false,
    error: null,
    initialized: false,
  }),

  withComputed(({ user }) => ({
    isLoggedIn: computed(() => !!user()),
    userEmail: computed(() => user()?.email ?? null),
  })),

  withMethods((store, supabase = inject(SupabaseService), router = inject(Router)) => ({

    async init(): Promise<void> {
      if (store.initialized()) return;

      patchState(store, { initialized: true });

      supabase.onAuthStateChange((_event, session) => {
        patchState(store, { user: session?.user ?? null });
      });

      const session = await supabase.getSession();
      patchState(store, { user: session?.user ?? null });
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
      const result = await supabase.signIn(email, password);
      if (!result.data || result.error) {
        patchState(store, {
          loading: false,
          error: result.error?.message ?? 'Sign in failed',
        });
        return;
      }
      patchState(store, {
        user: result.data.user,
        loading: false,
        error: null,
      });
      router.navigate(['/app/dashboard']);
    },

    async signOut(): Promise<void> {
      await supabase.signOut();
      patchState(store, { user: null, initialized: false });
      router.navigate(['/']);
    },

    clearError(): void {
      patchState(store, { error: null });
    },

  }))
);