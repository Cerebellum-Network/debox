import {
  Alert,
  Box,
  Button,
  Card, CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { Field, Form } from 'react-final-form';
import { FORM_ERROR, MutableState, Tools } from 'final-form';
import {
  ReactElement, useCallback, useContext, useEffect, useState,
} from 'react';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { usePromiseHook } from '../../lib/use-promise-hook';
import { findAccount, loadInjectedAccounts } from '../../lib/utils';
import { AppContext } from '../../app-context';
import { createClient } from '../../lib/ddc/operations';
import { CopyButton } from './copy-button';
import { forget, set } from '../../lib/local';

type Props = {
  children: string;
  onReady?: () => unknown;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateSecret = (_: any[], state: MutableState<any>, tools: Tools<any>) => {
  const { changeValue } = tools;
  changeValue(state, 'secret', () => mnemonicGenerate());
};

export function CreateClient({ children, onReady }: Props): ReactElement {
  const [open, setOpen] = useState(false);
  const { setAccount, setClient, account, client } = useContext(AppContext);
  const { data: accounts } = usePromiseHook(loadInjectedAccounts);

  useEffect(() => {
    if (client) {
      onReady?.();
    }
  }, [client, onReady]);

  const forgetClient = useCallback(() => {
    forget('secret');
    forget('bucket');
    setClient(undefined);
  }, [setClient]);

  const submit = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    async ({ address, secret }: { address: string; secret: string }) => {
      try {
        const userAccount = await findAccount(address);
        const ddcClient = await createClient(userAccount, secret);
        set('address', address);
        set('secret', secret);
        setAccount(userAccount);
        setClient(ddcClient);
        setOpen(false);
      } catch (e) {
        console.log({ e });
        return { [FORM_ERROR]: Object(e).message || 'Failed to choose a user.' };
      }
      return null;
    },
    [setAccount, setClient],
  );

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        {children}
      </Button>
      <Dialog maxWidth="md" fullWidth open={open}>
        <Card>
          <DialogTitle>Choose an account</DialogTitle>
          <Form
            mutators={{ generateSecret }}
            initialValues={{ address: account?.address ?? '', secret: '' }}
            onSubmit={submit}
          >
            {({
              handleSubmit, submitting, submitError, pristine, form,
            }) => {
              const { values } = form.getState();
              const isExistingClient = values.address === client?.smartContract.address;
              return (
                <>
                  <DialogContent>
                    {submitError && (
                      <Alert sx={{ marginBottom: '1rem' }} severity="error">
                        {submitError}
                      </Alert>
                    )}
                    <Field name="address">
                      {({ input }) => (
                        <FormControl margin="dense" variant="outlined" sx={{ width: '100%' }}>
                          <InputLabel sx={{ background: 'white' }} id="account-label">
                            Select account
                          </InputLabel>
                          <Select
                            labelId="account-label"
                            onChange={input.onChange}
                            sx={{ fontFamily: 'monospace', width: '100%' }}
                            value={input.value}
                          >
                            {(accounts ?? []).map((userAccount) => (
                              <MenuItem
                                sx={{ fontFamily: 'monospace' }}
                                key={userAccount.address}
                                value={userAccount.address}
                              >
                                [{userAccount.meta.name}]: {userAccount.address}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    </Field>
                    <Box
                      sx={{
                        display: 'grid',
                        gap: '0 1rem',
                        gridTemplateColumns: isExistingClient ? '1fr' : '1fr max-content max-content',
                        alignItems: 'end',
                      }}
                    >
                      <Field name="secret">
                        {({ input }) => (
                          <>
                            <Box>
                              <TextField
                                sx={{ width: '100%', marginTop: '2rem' }}
                                type={isExistingClient ? 'password' : 'text'}
                                disabled={isExistingClient}
                                name={input.name}
                                onChange={input.onChange}
                                onFocus={input.onFocus}
                                onBlur={input.onBlur}
                                variant="outlined"
                                label="secret"
                                helperText="After entering this field, please, keep it, as it's not possible to recover it"
                                value={isExistingClient ? '-'.repeat(20) : input.value}
                                required
                              />
                            </Box>
                            {
                              !isExistingClient && (
                                <>
                                  <Box sx={{ position: 'relative', top: '-1.7rem' }}>
                                    <CopyButton disabled={!input.value} value={input.value} />
                                  </Box>
                                  <Box sx={{ position: 'relative', top: '-1.7rem', justifySelf: 'end' }}>
                                    <Button onClick={form.mutators.generateSecret} variant="text">
                                      Generate secret
                                    </Button>
                                  </Box>
                                </>
                              )
                            }
                          </>
                        )}
                      </Field>
                    </Box>
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: 'flex-start', padding: '1.5rem' }}>
                    <Button
                      sx={{ gap: '0 .5rem' }}
                      disabled={submitting || pristine || isExistingClient}
                      onClick={handleSubmit}
                      variant="outlined"
                      color="primary"
                    >
                      {
                        submitting ? <><CircularProgress color="inherit" size={20} thickness={2} />{' '}Creating...</> : 'Create client'
                      }
                    </Button>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    {client && (
                      <Button
                        sx={{ marginLeft: 'auto!important' }}
                        onClick={forgetClient}
                        variant="text"
                        color="error"
                      >
                        Forget client
                      </Button>
                    )}
                  </DialogActions>
                </>
              );
            }}
          </Form>
        </Card>
      </Dialog>
    </>
  );
}
