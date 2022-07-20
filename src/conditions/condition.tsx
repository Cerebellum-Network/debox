import { ReactElement } from 'react';
import { ConditionProps } from './types';
import { conditionId, conditionKey } from './constants';

export function Condition({ condition, children }: ConditionProps): ReactElement {
  return condition ? <>{children}</> : <></>;
}

Condition[conditionKey] = conditionId;
