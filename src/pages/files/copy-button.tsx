import { ReactElement, useCallback, useState } from 'react';
import { Check, ContentCopy } from '@mui/icons-material';
import { IconButton } from '@mui/material';

type Props = {
  value: string;
  disabled: boolean;
};

export function CopyButton({ value, disabled }: Props): ReactElement | null {
  const [done, setDone] = useState(false);

  const copy = useCallback(() => {
    let mounted = true;
    navigator.clipboard.writeText(value).then(() => {
      if (mounted) {
        setDone(true);
        setTimeout(() => {
          if (mounted) {
            setDone(false);
          }
        }, 2000);
      }
    });
    return () => {
      mounted = false;
    };
  }, [value]);

  return typeof navigator.clipboard.writeText === 'function' ? (
    <IconButton disabled={disabled} color={done ? 'success' : 'default'} onClick={copy}>
      {done ? <Check /> : <ContentCopy />}
    </IconButton>
  ) : null;
}
