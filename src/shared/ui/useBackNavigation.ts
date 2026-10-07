import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Goes back in history when the user came from inside the app, otherwise to `fallback`
 * (a page opened from a bookmark or a new tab has no in-app history to return to).
 */
export function useBackNavigation(fallback: string) {
  const navigate = useNavigate();
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, fallback]);
}
