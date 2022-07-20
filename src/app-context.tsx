import {
  createContext, ReactElement, ReactNode, useMemo, useState,
} from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { DdcClient } from '@cere-ddc-sdk/ddc-client';

export const AppContext = createContext<{
  account: InjectedAccountWithMeta | undefined;
  setAccount:(account: InjectedAccountWithMeta) => unknown;
  privateKey: string;
  setPrivateKey: (key: string) => unknown;
  bucket: bigint;
  setBucket: (bucket: bigint) => unknown;
  client: DdcClient | undefined;
  setClient: (client: DdcClient | undefined) => unknown;
}>({
      account: undefined,
      setAccount: () => null,
      privateKey: '',
      setPrivateKey: () => null,
      bucket: 0n,
      setBucket: () => null,
      client: undefined,
      setClient: () => null,
    });

export function AppContextProvider({ children }: { children: ReactNode }): ReactElement {
  const [client, setClient] = useState<DdcClient | undefined>();
  const [bucket, setBucket] = useState(0n);
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
    }),
    [account, bucket, client, privateKey],
  );
  return (
    <AppContext.Provider value={ctx}>
      {children}
    </AppContext.Provider>
  );
}
