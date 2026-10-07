import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { api } from './api';

/**
 * Loads `path` whenever the screen gains focus. The spinner shows only on the
 * first load; later refreshes are silent. `pollMs` enables live polling.
 */
export function useApi(path, { pollMs } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasData = useRef(false);

  const load = useCallback(
    async (pull = false) => {
      if (pull === true) setRefreshing(true);
      else if (!hasData.current) setLoading(true);
      try {
        const result = await api(path);
        setData(result);
        setError(null);
        hasData.current = true;
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [path]
  );

  useFocusEffect(
    useCallback(() => {
      load();
      if (!pollMs) return undefined;
      const id = setInterval(() => load(), pollMs);
      return () => clearInterval(id);
    }, [load, pollMs])
  );

  return {
    data,
    error,
    loading,
    refreshing,
    reload: () => load(),
    pull: () => load(true),
  };
}
