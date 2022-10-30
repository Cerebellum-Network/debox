import { ReactElement, useCallback, useState } from 'react';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { Form, Field } from 'react-final-form';

type Props = {
  submit: (folder: string) => Promise<void>;
};

export function CreateFolder({ submit: save }: Props): ReactElement {
  const [open, setOpen] = useState(false);

  const submit = useCallback(async ({ folder }: { folder: string }) => {
    try {
      await save(folder);
    } finally {
      setOpen(false);
    }
  }, [save]);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Create folder
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <Form initialValues={{ folder: '' }} onSubmit={submit}>
          {({ handleSubmit, pristine, submitting }) => (
            <>
              <DialogTitle>Create folder</DialogTitle>
              <DialogContent>
                <Field name="folder">
                  {({ input }) => (
                    <TextField
                      autoFocus
                      margin="dense"
                      label="Folder name"
                      fullWidth
                      variant="outlined"
                      value={input.value}
                      onChange={input.onChange}
                    />
                  )}
                </Field>
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'flex-start', padding: '1.5rem' }}>
                <Button variant="outlined" sx={{ gap: '0 .5rem' }} disabled={pristine || submitting} onClick={handleSubmit}>
                  {
                    submitting ? <><CircularProgress color="inherit" size={20} thickness={2} />{' '}Creating...</> : 'Create'
                  }
                </Button>
                <Button color="secondary" onClick={() => setOpen(false)}>Cancel</Button>
              </DialogActions>
            </>
          )}
        </Form>
      </Dialog>
    </>
  );
}
