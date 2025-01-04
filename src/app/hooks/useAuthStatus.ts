import { useState, useEffect } from 'react';

export default function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('/api/blog-app/auth/status');
        const data = await res.json();
        setLoggedIn(data.loggedIn);
      } catch (error) {
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  return { loggedIn, loginStatusLoading: loading };
}
