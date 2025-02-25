/**
 * Authentication store for managing user state
 */
import { writable, derived } from 'svelte/store';
import { supabase } from '$lib/supabase';
import type { Session, User, AuthUser } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';

// Define the auth store state type
type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
};

// Create the auth store with initial state
const createAuthStore = () => {
  // Initial state
  const initialState: AuthState = {
    user: null,
    session: null,
    loading: true,
    initialized: false,
    error: null
  };
  
  const { subscribe, set, update } = writable<AuthState>(initialState);
  
  // Initialize the auth store
  async function initialize() {
    if (!browser) return;
    
    try {
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ ...initialState, loading: false, initialized: true, error: error.message });
        return;
      }
      
      if (session) {
        set({
          user: session.user,
          session,
          loading: false,
          initialized: true,
          error: null
        });
      } else {
        set({
          user: null,
          session: null,
          loading: false,
          initialized: true,
          error: null
        });
      }
      
      // Set up auth state change listener
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (event, newSession) => {
          if (event === 'SIGNED_IN' && newSession) {
            set({
              user: newSession.user,
              session: newSession,
              loading: false,
              initialized: true,
              error: null
            });
          } else if (event === 'SIGNED_OUT') {
            set({
              user: null,
              session: null,
              loading: false,
              initialized: true,
              error: null
            });
          } else if (event === 'TOKEN_REFRESHED' && newSession) {
            set({
              user: newSession.user,
              session: newSession,
              loading: false,
              initialized: true,
              error: null
            });
          }
        }
      );
      
      // Clean up subscription on page unload
      if (browser) {
        window.addEventListener('beforeunload', () => {
          subscription.unsubscribe();
        });
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
      set({
        ...initialState,
        loading: false,
        initialized: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Initialize the store when in browser environment
  if (browser) {
    initialize();
  }
  
  // Sign in with email and password
  async function signIn(email: string, password: string) {
    update(state => ({ ...state, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        update(state => ({ ...state, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
      
      update(state => ({
        ...state,
        user: data.user,
        session: data.session,
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      update(state => ({ ...state, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }
  
  // Sign up with email and password
  async function signUp(email: string, password: string) {
    update(state => ({ ...state, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        update(state => ({ ...state, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
      
      // If email confirmation is required, the user won't be signed in immediately
      if (data.user && data.session) {
        update(state => ({
          ...state,
          user: data.user,
          session: data.session,
          loading: false,
          error: null
        }));
        return { success: true, emailConfirmationRequired: false };
      } else {
        update(state => ({ ...state, loading: false }));
        return { success: true, emailConfirmationRequired: true };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      update(state => ({ ...state, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }
  
  // Sign out
  async function signOut() {
    update(state => ({ ...state, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        update(state => ({ ...state, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
      
      update(state => ({
        ...state,
        user: null,
        session: null,
        loading: false,
        error: null
      }));
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      update(state => ({ ...state, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }
  
  // Reset password
  async function resetPassword(email: string) {
    update(state => ({ ...state, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        update(state => ({ ...state, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
      
      update(state => ({ ...state, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      update(state => ({ ...state, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }
  
  // Update user profile
  async function updateProfile(profile: { username?: string; full_name?: string; avatar_url?: string }) {
    update(state => ({ ...state, loading: true, error: null }));
    
    try {
      // Get current state to access user
      let currentState: AuthState | undefined;
      const unsubscribe = subscribe(state => {
        currentState = state;
      });
      unsubscribe();
      
      if (!currentState?.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentState.user.id,
          updated_at: new Date().toISOString(),
          ...profile
        });
      
      if (error) {
        update(state => ({ ...state, loading: false, error: error.message }));
        return { success: false, error: error.message };
      }
      
      update(state => ({ ...state, loading: false }));
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      update(state => ({ ...state, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }
  
  // Check if the user is authenticated and redirect if not
  async function requireAuth(redirectTo: string = '/login') {
    if (browser) {
      // Wait for the auth store to be initialized
      let unsubscribe: (() => void) | undefined;
      await new Promise<void>((resolve) => {
        unsubscribe = subscribe((state) => {
          if (state.initialized) {
            resolve();
          }
        });
      });
      if (unsubscribe) unsubscribe();
      
      // Get the current state
      let currentState: AuthState | undefined;
      unsubscribe = subscribe((state) => {
        currentState = state;
      });
      if (unsubscribe) unsubscribe();
      
      // If not authenticated, redirect
      if (!currentState?.user) {
        goto(redirectTo);
        return false;
      }
      
      return true;
    }
    
    return false;
  }
  
  return {
    subscribe,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    requireAuth,
    initialize
  };
};

// Create and export the auth store
export const authStore = createAuthStore();

// Derived stores for convenience
export const user = derived(authStore, ($authStore) => $authStore.user);
export const isAuthenticated = derived(authStore, ($authStore) => !!$authStore.user);
export const isLoading = derived(authStore, ($authStore) => $authStore.loading);
export const authError = derived(authStore, ($authStore) => $authStore.error); 