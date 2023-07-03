/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  ChangeEvent,
  Fragment,
  memo,
  MouseEvent,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Folder, InsertDriveFile, MoreVert } from '@mui/icons-material';
import filesize from 'file-size';
import { stringToU8a } from '@polkadot/util';
import { useNavigate } from 'react-router-dom';
import { useStyles } from '../../styles';
import { AppContext } from '../../app-context';
import { CreateClient } from './create-client';
import { createFolder, loadFiles, readFile, uploadFile } from '../../lib/ddc/files';
import { unwrap } from '../../lib/unwrap';
import { BucketSelector } from './bucket-selector';
import { CreateFolder } from './create-folder';
import { delay } from '../../lib/delay';
import { useLoadFiles } from './use-load-files';
import cereLogo from '../cere-logo.svg';
import { decimals } from '../../blockchain/config';
import { createApi } from '../../blockchain/tools';

export const Files = memo((): ReactElement => {
  const styles = useStyles();
  const [balance, setBalance] = useState(0);
  const { client, bucket, account, path, setPath, files, setFiles } = useContext(AppContext);
  const navigate = useNavigate();

  const updateBalance = useCallback(async () => {
    if (account?.address) {
      const api = await createApi();
      const response = await api.query.system.account(account?.address);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = response.toJSON() as any;
      setBalance(data.free / 10 ** decimals);
      await api.disconnect();
    }
  }, [account?.address]);

  useEffect(() => {
    updateBalance().then(() => null);
  }, [updateBalance]);

  useEffect(() => {
    if (client == null) {
      navigate('/');
    }
  }, [client, navigate]);

  const currentFilePath = useMemo((): ReactElement[] => {
    const parts = path.split('/').filter(Boolean);

    if (!account || !client) {
      return [];
    }

    const partElements = [
      <Grid item alignItems="center" key="bucket">
        <BucketSelector onCreate={updateBalance} />
      </Grid>,
    ];

    if (bucket > 0n) {
      partElements.push(
        <Fragment key="bucket-controls">
          <MoreVert key="more-vert-icon" fontSize="small" color="secondary" />
          <Grid item alignItems="center" key="bucket">
            <Button variant="text" onClick={() => setPath('')}>
              /
            </Button>
          </Grid>
        </Fragment>,
      );
    }

    let linkPath = '';
    for (let i = 0; i < parts.length; i += 1) {
      const folderPath = [linkPath, parts[i]].join('/');
      linkPath += `${parts[i]}/`;

      partElements.push(
        <Grid item alignItems="center" key={linkPath}>
          <Button variant="text" onClick={i < parts.length ? () => setPath(folderPath) : undefined}>
            {' '}
            {parts[i]}
          </Button>
        </Grid>,
      );
    }

    return partElements;
  }, [account, bucket, client, path, setPath, updateBalance]);

  const loadFilesList = useLoadFiles();

  const uploadHandler = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target?.files?.[0];
    await uploadFile(unwrap(account).address, unwrap(client), bucket, unwrap(file), path);
    await delay(500);
    await loadFilesList();
    await updateBalance();
  };

  const changePath = useCallback(
    async (e: MouseEvent<HTMLElement>) => {
      const { folder } = e.currentTarget.dataset;
      setFiles([]);
      setPath((currentPath: string) => [currentPath, folder].join('/'));
      await loadFilesList();
    },
    [loadFilesList, setFiles, setPath],
  );

  const downloadFile = useCallback(
    async (e: MouseEvent<HTMLElement>) => {
      const { cid, name } = e.currentTarget.dataset;
      const file = await readFile(unwrap(client), bucket, unwrap(cid));

      const downloadLink = (urlLink: string) => {
        const link = document.createElement('a');
        link.href = urlLink;
        link.setAttribute('download', name ?? '');

        document.body.appendChild(link);

        link.click();
        setTimeout(() => document.body.removeChild(link), 1000);
      };

      if (file.data && file.data instanceof ReadableStream) {
        const fileReader = file.data.getReader();
        let result = await fileReader.read();
        const chunks = [];
        while (!result.done) {
          chunks.push(result.value);
          // eslint-disable-next-line no-await-in-loop
          result = await fileReader.read();
        }
        const blob = new Blob(chunks);
        downloadLink(window.URL.createObjectURL(blob));
      }

      if (typeof file.data === 'string') {
        const blob = new Blob([stringToU8a(file.data)]);
        downloadLink(window.URL.createObjectURL(blob));
      }

      if (file.data instanceof Uint8Array) {
        const blob = new Blob([file.data]);
        downloadLink(window.URL.createObjectURL(blob));
      }
    },
    [bucket, client],
  );

  const submitCreateFolder = useCallback(
    async (folder: string) => {
      await createFolder(unwrap(client), bucket, path, folder);
      await loadFiles(unwrap(client), bucket, path);
      await updateBalance();
    },
    [bucket, client, path, updateBalance],
  );

  useEffect(() => {
    if (client && bucket) {
      loadFilesList().catch(() => null);
    }
  }, [bucket, client, loadFilesList, path]);

  return (
    <div className={styles.app}>
      <Container fixed>
        <Box mt={4} display="flex" alignItems="center">
          <Box display="flex" gap={2} justifyContent="start" alignItems="center">
            <img alt="" src={cereLogo} />
            <span>DDC. Cere network</span>
          </Box>
          <Box ml="auto">
            <b>{account?.meta.name}:</b> {balance} CERE
          </Box>
        </Box>
        <Grid mt={4} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={6}>
            <Box display="flex" flexDirection="column" alignItems="left" justifyContent="left">
              <ButtonGroup>
                <Grid container direction="row" alignItems="center">
                  {currentFilePath}
                </Grid>
              </ButtonGroup>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              display="flex-end"
              flexDirection="column"
              alignItems="right"
              alignContent="right"
              justifyContent="right"
              className="m-6"
            >
              <Stack direction="row" spacing={2} justifyContent="end">
                <CreateClient>
                  {client ? 'Create another DDC client' : 'Create DDC client'}
                </CreateClient>
                <CreateFolder disabled={bucket === 0n} submit={submitCreateFolder} />
                <label htmlFor="contained-button-file">
                  <input
                    className={styles.hidden}
                    id="contained-button-file"
                    disabled={bucket === 0n}
                    multiple
                    type="file"
                    onChange={uploadHandler}
                  />
                  <Button disabled={bucket === 0n} variant="contained" component="span">
                    Upload
                  </Button>
                </label>
              </Stack>
            </Box>
          </Grid>
        </Grid>
        <Grid pt={3}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Size</TableCell>
                  <TableCell align="right">Kind</TableCell>
                  <TableCell align="right">Last modified</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow
                    key={file.name}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                      <Grid container direction="row" alignItems="center">
                        {/* <ShareButton dekPath={file.type === 'Folder' ? [path, file.name].join('/') : path} /> */}
                        {file.type === 'folder' ? (
                          <Box
                            sx={{ display: 'inline-flex', alignItems: 'center', gap: '0 0.2rem' }}
                            tabIndex={0}
                            role="link"
                            data-folder={file.name}
                            onClick={changePath}
                          >
                            <Folder color="primary" />
                            {file.name}
                          </Box>
                        ) : (
                          <Box
                            onClick={downloadFile}
                            data-cid={file.cid}
                            data-name={file.name}
                            sx={{ display: 'inline-flex', alignItems: 'center', gap: '0 0.2rem' }}
                          >
                            <InsertDriveFile color="primary" /> {file.name}
                          </Box>
                        )}
                      </Grid>
                    </TableCell>
                    <TableCell align="right">
                      {Number(file.size) ? filesize(Number(file.size)).human('jedec') : file.size}
                    </TableCell>
                    <TableCell align="right">{file.type}</TableCell>
                    <TableCell align="right">
                      {Number(file.dateAdded) ? new Date(Number(file.dateAdded)).toLocaleString() : file.dateAdded}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Container>
    </div>
  );
});
