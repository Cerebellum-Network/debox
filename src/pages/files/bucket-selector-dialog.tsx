import { ReactElement, useCallback, useContext, useMemo } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { Field, Form } from 'react-final-form';
import { MutableState, Tools } from 'final-form';
import { AppContext } from '../../app-context';
import { bucketsList, createBucket } from '../../lib/ddc/bucket';
import { InferPromiseType } from '../../types';
import { unwrap } from '../../lib/unwrap';
import { set } from '../../lib/local';

type BucketsStatuses = InferPromiseType<ReturnType<typeof bucketsList>>;

type Props = {
  onClose: () => unknown;
  buckets: BucketsStatuses;
};

type FormProps = {
  bucket: number;
  balance: number;
  size: number;
  replication: number;
  create: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resetBucket = (_: any[], state: MutableState<any>, tools: Tools<any>) => {
  const { changeValue } = tools;
  changeValue(state, 'bucket', () => 0);
};

export function BucketSelectorDialog({ onClose, buckets }: Props): ReactElement {
  const { bucket, client, setBucket } = useContext(AppContext);

  const initialValues: FormProps = useMemo(
    () => ({ bucket: Number(bucket), balance: 10, size: 3, replication: 1, create: false }),
    [bucket],
  );

  const submit = useCallback(
    async (values: FormProps) => {
      const { balance, bucket: selectedBucket, create, replication, size } = values;
      const applyBucketSelection = (bucketId: bigint) => {
        setBucket(bucketId);
        set('bucket', bucketId.toString(10));
      };
      if (create) {
        const createdBucket = await createBucket(unwrap(client), {
          replication,
          balance: BigInt(balance),
          size: BigInt(size),
        });
        applyBucketSelection(createdBucket);
      } else if (selectedBucket) {
        applyBucketSelection(BigInt(selectedBucket));
      }
      onClose();
    },
    [client, onClose, setBucket],
  );

  return (
    <Form mutators={{ resetBucket }} initialValues={initialValues} onSubmit={submit}>
      {({ handleSubmit, pristine, submitting, form }) => {
        const { create, bucket: selectedBucket } = form.getState().values;
        if (create && selectedBucket !== 0) {
          form.mutators.resetBucket();
        }
        return (
          <>
            <DialogTitle>Create or select bucket</DialogTitle>
            <DialogContent>
              <Box mt="1" display="flex" justifyContent="center">
                <Field type="checkbox" name="create">
                  {({ input }) => (
                    <FormControlLabel
                      control={<Switch onChange={input.onChange} value={input.value} />}
                      label="Create a bucket"
                    />
                  )}
                </Field>
              </Box>
              <Box
                sx={{
                  display: create ? 'grid' : 'none',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0 1rem',
                }}
              >
                <Field name="balance">
                  {({ input }) => (
                    <TextField
                      type="number"
                      sx={{ width: '100%', marginTop: '2rem' }}
                      name={input.name}
                      onChange={input.onChange}
                      onFocus={input.onFocus}
                      onBlur={input.onBlur}
                      margin="dense"
                      variant="outlined"
                      label="Balance"
                      helperText="Amount of tokens to deposit to the bucket balance"
                      value={input.value}
                      required
                    />
                  )}
                </Field>
                <Field name="size">
                  {({ input }) => (
                    <TextField
                      type="number"
                      sx={{ width: '100%', marginTop: '2rem' }}
                      name={input.name}
                      onChange={input.onChange}
                      onFocus={input.onFocus}
                      onBlur={input.onBlur}
                      margin="dense"
                      variant="outlined"
                      label="Bucket size"
                      helperText="Bucket size in GB"
                      value={input.value}
                      required
                    />
                  )}
                </Field>
                <Field name="replication">
                  {({ input }) => (
                    <TextField
                      type="number"
                      sx={{ width: '100%', marginTop: '2rem' }}
                      name={input.name}
                      onChange={input.onChange}
                      onFocus={input.onFocus}
                      onBlur={input.onBlur}
                      margin="dense"
                      variant="outlined"
                      label="Replication"
                      helperText="Number of copies of each piece. Minimum 1. Maximum 9. Temporary limited to 3. Default 1"
                      value={input.value}
                      required
                    />
                  )}
                </Field>
              </Box>
              <Divider sx={{ margin: '2rem 0 1rem' }} textAlign="center">
                or choose from existing
              </Divider>
              <Field name="bucket">
                {({ input }) => (
                  <FormControl sx={{ width: '100%' }} margin="dense" variant="outlined">
                    <InputLabel sx={{ background: 'white' }} id="account-label">
                      Select account
                    </InputLabel>
                    <Select
                      sx={{ width: '100%', fontFamily: 'monospace' }}
                      labelId="account-label"
                      disabled={(buckets ?? []).length === 0 || create}
                      onChange={input.onChange}
                      value={input.value}
                    >
                      {(buckets ?? []).map((bucketStatus) => (
                        <MenuItem
                          sx={{ fontFamily: 'monospace' }}
                          key={bucketStatus.bucketId}
                          value={bucketStatus.bucketId}
                        >
                          [Bucket]: {bucketStatus.bucketId}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Field>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'flex-start', padding: '1.5rem' }}>
              <Button
                sx={{ gap: '0 .5rem' }}
                disabled={submitting || pristine}
                onClick={handleSubmit}
                variant="outlined"
              >
                {submitting ? (
                  <>
                    <CircularProgress color="inherit" size={20} thickness={2} /> Creating...
                  </>
                ) : (
                  'Apply'
                )}
              </Button>
              <Button onClick={onClose} variant="text">
                Cancel
              </Button>
            </DialogActions>
          </>
        );
      }}
    </Form>
  );
}
