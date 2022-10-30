import { ReactElement, useCallback, useContext, useState } from 'react';
import { Share } from '@mui/icons-material';
import { Form, Field } from 'react-final-form';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import { AppContext } from '../../app-context';
import { unwrap } from '../../lib/unwrap';

type Props = {
  dekPath: string;
};

type FormProps = {
  address: string;
};

export function ShareButton({ dekPath }: Props): ReactElement {
  const [open, setOpen] = useState(false);
  const { client, bucket } = useContext(AppContext);

  const submit = useCallback(async (values: FormProps) => {
    await unwrap(client).shareData(bucket, dekPath, values.address);
    setOpen(false);
  }, [bucket, client, dekPath]);

  return (
    <>
      <IconButton onClick={() => setOpen(true)} color="primary" title="share" aria-label="share" size="small">
        <Share />
      </IconButton>
      <Dialog maxWidth="md" fullWidth open={open}>
        <Form onSubmit={submit}>
          {({ handleSubmit, pristine, submitting }) => (
            <>
              <DialogTitle>Share</DialogTitle>
              <DialogContent>
                <Alert sx={{ marginBottom: '2rem' }} severity="warning">
                  This action is irreversible and can&#039;t be undone.
                </Alert>
                <Field name="address">
                  {({ input }) => (
                    <TextField
                      margin="dense"
                      value={input.value}
                      onChange={input.onChange}
                      onFocus={input.onFocus}
                      onBlur={input.onBlur}
                      variant="outlined"
                      name={input.name}
                      fullWidth
                      label="Enter a public key to share"
                    />
                  )}
                </Field>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'flex-start', padding: '1.5rem' }}>
                <Button
                  sx={{ gap: '0 .5rem' }}
                  disabled={pristine || submitting}
                  variant="outlined"
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <>
                      <CircularProgress color="inherit" size={20} thickness={2} /> Sharing...
                    </>
                  ) : (
                    'Share'
                  )}
                </Button>
                <Button variant="text" color="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </DialogActions>
            </>
          )}
        </Form>
      </Dialog>
    </>
  );
}
