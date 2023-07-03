import {
  createContext, ReactElement, ReactNode, useCallback, useMemo, useState,
} from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import { File } from './file';

export const AppContext = createContext<{
  account: InjectedAccountWithMeta | undefined;
  setAccount:(account: InjectedAccountWithMeta) => unknown;
  path: string;
  setPath: (key: string | ((path: string) => string)) => unknown;
  bucket: bigint;
  setBucket: (bucket: bigint) => unknown;
  client: DdcClient | undefined;
  setClient: (client: DdcClient | undefined) => unknown;
  files: File[];
  setFiles: (files: File[]) => unknown;
}>({
      account: undefined,
      setAccount: () => null,
      path: '',
      setPath: () => null,
      bucket: 0n,
      setBucket: () => null,
      client: undefined,
      setClient: () => null,
      files: [],
      setFiles: () => null,
    });

export function AppContextProvider({ children }: { children: ReactNode }): ReactElement {
  const [client, setClient] = useState<DdcClient | undefined>();
  const [path, setPath] = useState('');
  const [bucket, setBucketState] = useState(0n);
  const [files, setFiles] = useState<File[]>([]);
  const [account, setAccountState] = useState<InjectedAccountWithMeta | undefined>();

  const setAccount = useCallback((user: InjectedAccountWithMeta) => {
    setPath('');
    setBucketState(0n);
    setAccountState(user);
  }, []);

  const setBucket = useCallback((bucketId: bigint) => {
    setPath('');
    setBucketState(bucketId);
  }, []);

  const ctx = useMemo(
    () => ({
      account,
      setAccount,
      bucket,
      setBucket,
      client,
      setClient,
      path,
      setPath,
      files,
      setFiles,
    }),
    [account, bucket, client, files, path, setAccount, setBucket],
  );
  return (
    <AppContext.Provider value={ctx}>
      {children}
    </AppContext.Provider>
  );
}
