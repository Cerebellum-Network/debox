import { ReactElement, useContext, useState } from 'react';
import { Button, Dialog } from '@mui/material';
import { BucketSelectorDialog } from './bucket-selector-dialog';
import { AppContext } from '../../app-context';

export function BucketSelector(): ReactElement {
  const { bucket } = useContext(AppContext);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        color="secondary"
        variant="text"
      >{bucket ? `Bucket id: [${bucket}]` : 'Select bucket'}
      </Button>
      <Dialog maxWidth="md" fullWidth onClose={() => setOpen(false)} open={open}>
        <BucketSelectorDialog onClose={() => setOpen(false)} />
      </Dialog>
    </>
  );
}
