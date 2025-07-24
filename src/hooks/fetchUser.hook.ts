import { useState, useEffect } from "react";
import { API_URL } from "@/constants/api.constants";

interface User {
  id: number;
  name: string;
  permissions: string;
  username?: string;
}

interface UseFetchUserResult {
  users: User[];
  loading: boolean;
  error: Error | null;
}

interface UseCurrentUserResult {
  currentUser: User | null;
  loading: boolean;
  error: Error | null;
}

export const useFetchUser = (): UseFetchUserResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get token from localStorage or cookies
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/users`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid, clear it
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
            }
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();
        // Data should be an array of users from the /users endpoint
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch users")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};

// Separate hook for current authenticated user
export const useCurrentUser = (): UseCurrentUserResult => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Get token from localStorage or cookies
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/user`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid, clear it
            if (typeof window !== 'undefined') {
              localStorage.removeItem('authToken');
              localStorage.removeItem('user');
            }
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();
        setCurrentUser(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch current user")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return { currentUser, loading, error };
};
