import { ReactElement, Children } from 'react';
import { ConditionProps } from './types';
import { isAllowedChild, isDefaultsChild } from './utils';

type Props = {
  children: ReactElement<ConditionProps> | ReactElement<ConditionProps>[];
  multiply?: boolean;
};

export function ConditionsList({ children, multiply = false }: Props): ReactElement {
  const conditionItems: ReactElement<ConditionProps>[] = Children.toArray(
    children,
  ) as ReactElement<ConditionProps>[];
  const limit = multiply ? Number.MAX_SAFE_INTEGER : 1;
  return (
    <>
      {conditionItems
        .filter((child) => child.props.condition || isDefaultsChild(child))
        .filter(isAllowedChild)
        .slice(0, limit)}
    </>
  );
}
