import { ReactElement, useCallback, useState } from 'react';
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStyles } from '../styles';

export function Home(): ReactElement {
  const styles = useStyles();
  const navigate = useNavigate();
  const [privateKey, setPrivateKey] = useState(String(process.env.REACT_APP_PRIVATE_KEY));
  const [allowFrontend, setAllowFrontend] = useState(false);
  const [allowBackend, setAllowBackend] = useState(false);

  const toBackend = useCallback(() => {
    navigate('/files', { state: { mode: 'backend' } });
  }, [navigate]);

  const toFrontend = useCallback(() => {
    navigate('/files', { state: { mode: 'frontend' } });
  }, [navigate]);

  const toFull = useCallback(() => {
    navigate('/files', { state: { mode: 'full' } });
  }, [navigate]);

  const handleOpenAllowFrontendModal = () => setAllowFrontend(true);
  const handleCloseAllowFrontendModal = () => setAllowFrontend(false);

  const handleOpenAllowBackendModal = () => setAllowBackend(true);
  const handleCloseAllowBackendModal = () => setAllowBackend(false);
  return (
    <div className={styles.app}>
      <Container fixed>
        <Stack spacing={2} justifyContent="center" alignItems="center" direction="row" pt={3}>
          <Button variant="outlined" onClick={toFull}>
            Full control
          </Button>
          <Button variant="outlined" onClick={handleOpenAllowBackendModal}>
            Trust Backend App
          </Button>
          <Button variant="outlined" onClick={handleOpenAllowFrontendModal}>
            Trust Frontend App
          </Button>
        </Stack>
      </Container>

      <Dialog open={allowBackend} onClose={handleCloseAllowBackendModal} fullWidth>
        <DialogTitle>
          Here you should give an access to some backend service to access your bucket
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseAllowBackendModal}>Cancel</Button>
          <Button variant="contained" disableElevation onClick={toBackend}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={allowFrontend} onClose={handleCloseAllowFrontendModal} fullWidth>
        <DialogTitle>Private key to be used for requests signing</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="privateKey"
            label="Private key"
            fullWidth
            variant="standard"
            value={privateKey}
            onChange={(e) => {
              setPrivateKey(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAllowFrontendModal}>Cancel</Button>
          <Button onClick={toFrontend}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
