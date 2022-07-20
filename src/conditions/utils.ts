import { ReactElement } from 'react';
import { get } from 'lodash';

import {
  conditionId, conditionKey, defaultKey, defaultsId,
} from './constants';

export function isConditionChild(child: ReactElement): boolean {
  return get(child, ['type', conditionKey]) === conditionId;
}

export function isDefaultsChild(child: ReactElement): boolean {
  return get(child, ['type', defaultKey]) === defaultsId;
}

export function isAllowedChild(child: ReactElement): boolean {
  return isConditionChild(child) || isDefaultsChild(child);
}
