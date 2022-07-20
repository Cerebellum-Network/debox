import {
  ReactElement, useCallback, useContext, useMemo,
} from 'react';
import {
  Button, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select,
} from '@mui/material';
import { Field, Form } from 'react-final-form';
import { AppContext } from '../../app-context';
import { bucketsList } from '../../ddc-operations/operations';
import { unwrap } from '../../unwrap';
import { usePromiseHook } from '../../use-promise-hook';

// import { AppContext } from '../../app-context';
// import { bucketsList } from '../../ddc-operations/operations';
// import { unwrap } from '../../unwrap';

type Props = {
  onClose: () => unknown;
};

export function BucketSelectorDialog({ onClose }: Props): ReactElement {
  const { bucket, client, account } = useContext(AppContext);

  const loadBuckets = useCallback(() => bucketsList(unwrap(client), unwrap(account).address), [
    account,
    client,
  ]);

  const { data } = usePromiseHook(loadBuckets);
  const bucketStatuses = data?.bucketStatuses ?? [];

  const initialValues = useMemo(() => ({ bucket }), [bucket]);

  const submit = useCallback((values: any) => {
    console.log(values);
  }, []);

  return (
    <Form initialValues={initialValues} onSubmit={submit}>
      {({ handleSubmit }) => (
        <>
          <DialogTitle>Create or select bucket</DialogTitle>
          <DialogContent>
            <Field name="bucket">
              {({ input }) => (
                <FormControl margin="dense" variant="outlined" sx={{ width: '100%' }}>
                  <InputLabel sx={{ background: 'white' }} id="account-label">
                    Select account
                  </InputLabel>
                  <Select
                    labelId="account-label"
                    onChange={input.onChange}
                    sx={{ fontFamily: 'monospace' }}
                    value={input.value}
                    autoWidth
                  >
                    {(bucketStatuses ?? []).map((bucketStatus) => (
                      <MenuItem
                        sx={{ fontFamily: 'monospace' }}
                        key={bucketStatus.bucket_id}
                        value={bucketStatus.bucket_id}
                      >
                        [Bucket]: {bucketStatus.bucket_id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Field>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start', padding: '1.5rem' }}>
            <Button onClick={handleSubmit} variant="outlined">
              Apply
            </Button>
            <Button onClick={onClose} variant="text">
              Cancel
            </Button>
          </DialogActions>
        </>
      )}
    </Form>
  );
}
