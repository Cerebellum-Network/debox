type Result<T> = {
  read: () => T
};

export function createSuspender<T>(fn: () => Promise<T>): Result<T> {
  let result: T;
  let status: 'pending' | 'failed' | 'success' = 'pending';
  let error: unknown;
  const suspender = fn();
  suspender.then((data) => {
    result = data;
    status = 'success';
  }).catch((reason) => {
    error = reason;
    status = 'failed';
  });
  return {
    read: () => {
      if (status === 'pending') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw suspender;
      }
      if (status === 'failed') {
        throw error;
      }
      if (status === 'success') {
        return result;
      }
      throw Error('unreachable');
    },
  };
}
