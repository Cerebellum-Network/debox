import { ReactElement, useCallback, useContext, useEffect } from 'react';
import { Container, Stack, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import cereLogo from './cere-logo.svg';

import { useStyles } from '../styles';
import { CreateClient } from './files/create-client';
import { AppContext } from '../app-context';

export function Home(): ReactElement {
  const styles = useStyles();
  const { client } = useContext(AppContext);
  const navigate = useNavigate();

  const toFiles = useCallback(() => {
    navigate('/files');
  }, [navigate]);

  useEffect(() => {
    if (client) {
      toFiles();
    }
  }, [client, toFiles]);

  return (
    <div className={styles.app}>
      <Container fixed>
        <Box mt={24} display="flex" gap={2} justifyContent="center" alignItems="center">
          <img alt="" src={cereLogo} />
          <span>DDC. Cere network</span>
        </Box>
        <Stack spacing={2} justifyContent="center" alignItems="center" direction="row" pt={3}>
          <CreateClient onReady={toFiles}>Connect to DDC</CreateClient>
        </Stack>
        <Box mt={6}>
          <Typography variant="body2">
            <a
              rel="nofollow noopener noreferrer"
              target="_blank"
              href="https://docs.cere.network/ddc/overview"
              title="DDC documentation."
            >
              DDC documentation.
            </a>
          </Typography>
          <Typography variant="body2">
            This{' '}
            <a
              href="https://polkadot.js.org/extension/"
              title="Polkadot browser extension"
              rel="nofollow noopener noreferrer"
              target="_blank"
            >
              extension
            </a>{' '}
            is required to use this app.
          </Typography>
        </Box>
      </Container>
    </div>
  );
}
