import { ReactElement, useCallback, useContext, useState } from 'react';
import { Button, Dialog, IconButton } from '@mui/material';
import { Replay } from '@mui/icons-material';
import { BucketSelectorDialog } from './bucket-selector-dialog';
import { AppContext } from '../../app-context';
import { bucketsList } from '../../lib/ddc/bucket';
import { unwrap } from '../../lib/unwrap';
import { usePromiseHook } from '../../lib/use-promise-hook';
import { useLoadFiles } from './use-load-files';

type Props = {
  onCreate: () => Promise<unknown>;
};

export function BucketSelector({ onCreate }: Props): ReactElement {
  const { bucket, account, client } = useContext(AppContext);
  const [reloading, setReloading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadBuckets = useCallback(() => bucketsList(unwrap(account).address), [account]);

  const loadFiles = useLoadFiles();

  const loadFilesList = async () => {
    setReloading(true);
    try {
      await loadFiles();
    } finally {
      setReloading(false);
    }
  };

  const { data: bucketStatuses, mutate } = usePromiseHook(loadBuckets);
  const onClose = useCallback(async () => {
    mutate();
    await onCreate();
    setOpen(false);
  }, [mutate, onCreate]);

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
        <BucketSelectorDialog buckets={bucketStatuses ?? []} onClose={onClose} />
      </Dialog>
    </>
  );
}
