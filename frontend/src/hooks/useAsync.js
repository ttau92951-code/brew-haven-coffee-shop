import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Small data-fetching helper used across the pages.
 * Returns the latest data, loading/error flags and a `reload` function.
 */
export function useAsync(task, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const taskRef = useRef(task);
  taskRef.current = task;

  const run = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const data = await taskRef.current();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === 'function' ? updater(current.data) : updater
    }));
  }, []);

  return { ...state, reload: run, setData };
}
