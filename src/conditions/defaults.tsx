import { ReactElement, ReactNode } from 'react';
import { defaultKey, defaultsId } from './constants';

export function Defaults({ children }: { children: ReactNode }): ReactElement {
  return <>{children}</>;
}

Defaults[defaultKey] = defaultsId;
