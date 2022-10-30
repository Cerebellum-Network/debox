import { useEffect, useState } from 'react';

export function usePromiseHook<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<unknown | undefined>();
  const [count, setCount] = useState(1);

  useEffect(() => {
    const promise = new Promise<T>((resolve, reject) => {
      try {
        fn().then(resolve).catch(reject);
      } catch (e) {
        reject(Error('Uncaught'));
      }
    });
    let mounted = count > 0;
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
  }, [count, fn]);
  return { data, error, mutate: () => setCount((state) => state + 1) };
}
