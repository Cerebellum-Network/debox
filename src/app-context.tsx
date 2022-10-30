import {
  createContext, ReactElement, ReactNode, useMemo, useState,
} from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { DdcClient } from '@cere-ddc-sdk/ddc-client';
import { File } from './file';

export const AppContext = createContext<{
  account: InjectedAccountWithMeta | undefined;
  setAccount:(account: InjectedAccountWithMeta) => unknown;
  privateKey: string;
  setPrivateKey: (key: string) => unknown;
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
      path: 'Files',
      setPath: () => null,
      privateKey: '',
      setPrivateKey: () => null,
      bucket: 0n,
      setBucket: () => null,
      client: undefined,
      setClient: () => null,
      files: [],
      setFiles: () => null,
    });

export function AppContextProvider({ children }: { children: ReactNode }): ReactElement {
  const [client, setClient] = useState<DdcClient | undefined>();
  const [path, setPath] = useState('Files');
  const [bucket, setBucket] = useState(0n);
  const [files, setFiles] = useState<File[]>([]);
  const [account, setAccount] = useState<InjectedAccountWithMeta | undefined>();
  const [privateKey, setPrivateKey] = useState(String(process.env.REACT_APP_PRIVATE_KEY));
  const ctx = useMemo(
    () => ({
      account,
      setAccount,
      privateKey,
      setPrivateKey,
      bucket,
      setBucket,
      client,
      setClient,
      path,
      setPath,
      files,
      setFiles,
    }),
    [account, bucket, client, files, path, privateKey],
  );
  return (
    <AppContext.Provider value={ctx}>
      {children}
    </AppContext.Provider>
  );
}
