'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';

// Module-level flag — persists across component mounts/unmounts
let didAttemptRefresh = false;

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    // Only attempt silent refresh once per page load, and only if
    // we haven't already authenticated (e.g. via login/register)
    if (!didAttemptRefresh && store.isLoading && !store.isAuthenticated) {
      didAttemptRefresh = true;

      // Check if we even have a token worth refreshing
      const hasToken = typeof window !== 'undefined' && sessionStorage.getItem('accessToken');
      if (hasToken) {
        store.refreshAuth();
      } else {
        // No token at all — skip the API call, just mark as not authenticated
        store.setUser(null);
      }
    }
  }, [store.isLoading, store.isAuthenticated]);

  return store;
}
