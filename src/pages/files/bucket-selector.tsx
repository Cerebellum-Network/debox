import { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Button, Dialog, IconButton } from '@mui/material';
import { Replay } from '@mui/icons-material';
import { BucketSelectorDialog } from './bucket-selector-dialog';
import { AppContext } from '../../app-context';
import { bucketsList } from '../../lib/ddc/bucket';
import { unwrap } from '../../lib/unwrap';
import { usePromiseHook } from '../../lib/use-promise-hook';
import { useLoadFiles } from './use-load-files';

export function BucketSelector(): ReactElement {
  const { bucket, account, client } = useContext(AppContext);
  const [reloading, setReloading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadBuckets = useCallback(() => bucketsList(unwrap(client), unwrap(account).address), [
    account,
    client,
  ]);

  const loadFiles = useLoadFiles();

  const loadFilesList = async () => {
    setReloading(true);
    try {
      await loadFiles();
    } finally {
      setReloading(false);
    }
  };

  const { data, mutate } = usePromiseHook(loadBuckets);
  const bucketStatuses = data?.bucketStatuses ?? [];
  const onClose = useCallback(() => {
    mutate();
    setOpen(false);
  }, [mutate]);

  useEffect(() => {
    console.log({ data });
  }, [data]);

  return (
    <>
      <IconButton
        disabled={reloading || !client || !bucket}
        onClick={loadFilesList}
        sx={{ transition: 'color 300ms linear' }}
        color={reloading ? 'inherit' : 'secondary'}
      >
        <Replay />
      </IconButton>
      <Button onClick={() => setOpen(true)} color="secondary" variant="text">
        {bucket ? `Bucket id: [${bucket}]` : 'Select bucket'}
      </Button>
      <Dialog maxWidth="md" fullWidth onClose={() => setOpen(false)} open={open}>
        <BucketSelectorDialog buckets={bucketStatuses} onClose={onClose} />
      </Dialog>
    </>
  );
}
