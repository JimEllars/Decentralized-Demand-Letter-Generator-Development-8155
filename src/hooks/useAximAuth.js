import { useState, useEffect } from 'react';

export const useAximAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for axim_session cookie
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find((c) => c.trim().startsWith('axim_session='));

    if (sessionCookie) {
      try {
        // Mock parsing the session token for now. In a real app, this might be a JWT.
        // Or we would call https://passport.axim.us.com/auth/verify
        const token = sessionCookie.split('=')[1];
        // For demonstration, we just set a mock user if the cookie exists.
        setIsAuthenticated(true);
        setUser({ email: 'user@example.com' });
      } catch (e) {
        console.error('Failed to parse axim_session cookie', e);
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = () => {
    window.location.href = `https://passport.axim.us.com/login?redirect_uri=${window.location.origin}/auth/callback&app_id=demand-letter`;
  };

  const logout = () => {
    // Clear cookie (if we have access to do so, though it might be HttpOnly or Domain restricted in real life)
    document.cookie = 'axim_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Explicitly DO NOT clear local storage for drafts to preserve user work
    // We only clear auth-related session storage if needed, but not draft state

    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, login, logout };
};
