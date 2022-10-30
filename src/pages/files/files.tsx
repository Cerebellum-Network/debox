/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ChangeEvent, MouseEvent, ReactElement, useCallback, useContext, useEffect, useMemo } from 'react';
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
import { ArrowRight, Folder, InsertDriveFile, MoreVert } from '@mui/icons-material';
import filesize from 'file-size';
import { stringToU8a } from '@polkadot/util';

import { useStyles } from '../../styles';
import { AppContext } from '../../app-context';
import { CreateClient } from './create-client';
import { initClient } from '../../lib/ddc/operations';
import { createFolder, loadFiles, readFile, uploadFile } from '../../lib/ddc/files';
import { unwrap } from '../../lib/unwrap';
import { BucketSelector } from './bucket-selector';
import { createSuspender } from '../../lib/create-suspender';
import { CreateFolder } from './create-folder';
import { delay } from '../../lib/delay';
import { useLoadFiles } from './use-load-files';
import { ShareButton } from './share-button';
import cereLogo from '../cere-logo.svg';

const clientSuspender = createSuspender(initClient);

export function Files(): ReactElement {
  const styles = useStyles();
  const {
    client,
    bucket,
    setBucket,
    account,
    setAccount,
    setClient,
    path,
    setPath,
    files,
    setFiles,
  } = useContext(AppContext);
  const response = clientSuspender.read();

  useEffect(() => {
    if (response.client) {
      setClient(response.client);
    }
    if (response.account) {
      setAccount(response.account);
    }
    if (response.bucket) {
      setBucket(response.bucket);
    }
  }, [response, setAccount, setBucket, setClient]);

  const renderPath = useMemo((): ReactElement[] => {
    const parts = path.split('/');

    if (!account || !client) {
      return [];
    }

    const partElements = [
      <Grid item alignItems="center" key="bucket">
        <BucketSelector />
      </Grid>,
      <MoreVert key="icon" fontSize="small" color="secondary" />,
      <Grid item alignItems="center" key="bucket">
        <Button variant="text" onClick={() => setPath('')}>
          {' '}
          /
        </Button>
      </Grid>,
      <MoreVert key="icon" fontSize="small" color="secondary" />,
    ];
    let linkPath = '';
    for (let i = 0; i < parts.length - 1; i += 1) {
      const folderPath = linkPath + parts[i];
      linkPath += `${parts[i]}/`;

      partElements.push(
        <Grid item alignItems="center" key={linkPath}>
          <Button variant="text" onClick={() => setPath(folderPath)}>
            {' '}
            {parts[i]}
          </Button>
        </Grid>,
      );
      partElements.push(<ArrowRight color="primary" key="arrow" />);
    }

    linkPath += parts[parts.length - 1];
    partElements.push(
      <Grid item alignItems="center" key={linkPath}>
        <Button variant="text" onClick={() => setPath(linkPath)}>
          {' '}
          {parts[parts.length - 1]}
        </Button>
      </Grid>,
    );

    return partElements;
  }, [account, client, path, setPath]);

  const loadFilesList = useLoadFiles();

  const uploadHandler = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target?.files?.[0];
    await uploadFile(unwrap(account).address, unwrap(client), bucket, unwrap(file), path);
    await delay(500);
    await loadFilesList();
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
      const file = await readFile(unwrap(client), bucket, unwrap(cid), path);

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
    [bucket, client, path],
  );

  const submitCreateFolder = useCallback(
    async (folder: string) => {
      await createFolder(unwrap(client), bucket, path, folder);
      await loadFiles(unwrap(client), bucket, path);
    },
    [bucket, client, path],
  );

  useEffect(() => {
    if (client && bucket) {
      loadFilesList();
    }
  }, [bucket, client, loadFilesList, path]);

  return (
    <div className={styles.app}>
      <Container fixed>
        <Box mt={4} display="flex" gap={2} justifyContent="start" alignItems="center">
          <img alt="" src={cereLogo} />
          <span>DDC. Cere network</span>
        </Box>
        <Grid mt={4} container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={6}>
            <Box display="flex" flexDirection="column" alignItems="left" justifyContent="left">
              <ButtonGroup>
                <Grid container direction="row" alignItems="center">
                  {renderPath}
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
                <CreateFolder submit={submitCreateFolder} />
                <label htmlFor="contained-button-file">
                  <input
                    className={styles.hidden}
                    id="contained-button-file"
                    multiple
                    type="file"
                    onChange={uploadHandler}
                  />
                  <Button variant="contained" component="span">
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
                  <TableCell align="right">Date added</TableCell>
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
                        <ShareButton dekPath={file.type === 'Folder' ? [path, file.name].join('/') : path} />
                        {file.type === 'Folder' ? (
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
                      {Number(file.dateAdded)
                        ? new Date(Number(file.dateAdded)).toLocaleString()
                        : file.dateAdded}
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
}
