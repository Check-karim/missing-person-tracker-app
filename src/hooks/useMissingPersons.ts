import { useState, useEffect } from 'react';
import { MissingPerson } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface UseMissingPersonsOptions {
  status?: string;
  priority?: string;
  search?: string;
  autoFetch?: boolean;
}

export function useMissingPersons(options: UseMissingPersonsOptions = {}) {
  const { status, priority, search, autoFetch = true } = options;
  const { token } = useAuth();
  const [persons, setPersons] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPersons = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (search) params.append('search', search);

      const response = await fetch(`/api/missing-persons?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch missing persons');
      }

      const data = await response.json();
      setPersons(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchPersons();
    }
  }, [status, priority, search, autoFetch]);

  return {
    persons,
    loading,
    error,
    refetch: fetchPersons,
  };
}

