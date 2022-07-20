import { ReactElement } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

type Props = {
  text: string;
};

export function Loading({ text }: Props): ReactElement {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, gap: '0 1rem' }}
      open
    >
      {text}
      <CircularProgress size={32} thickness={3} color="inherit" />
    </Backdrop>
  );
}
