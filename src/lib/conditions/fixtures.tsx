import { ReactNode, useCallback, useState } from 'react';

type Props = {
  children: ReactNode;
  // eslint-disable-next-line react/no-unused-prop-types
  condition?: boolean;
};

export function Unknown({ children }: Props) {
  return <div>{children}</div>;
}

Unknown.defaultProps = {
  condition: true,
};

type InteractiveProps = {
  children: (state: boolean) => ReactNode;
};

export function Interactive({ children }: InteractiveProps) {
  const [state, setState] = useState(false);

  const change = useCallback(() => {
    setState((s) => !s);
  }, []);

  return (
    <div>
      {children(state)}
      <button onClick={change}>Change</button>
    </div>
  );
}
