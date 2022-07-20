import { useEffect, useMemo, useState } from 'react';

export function usePromiseHook<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<unknown | undefined>();
  const promise = useMemo(() => fn(), [fn]);
  useEffect(() => {
    let mounted = true;
    promise.then((result) => {
      if (mounted) {
        setData(result);
      }
    }).catch((errorReason) => {
      if (mounted) {
        setError(errorReason);
      }
    });
    return () => {
      mounted = false;
    };
  }, [promise]);
  return { data, error };
}
