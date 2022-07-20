import {
  ChangeEvent, ReactElement, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { ArrowRight, MoreVert } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStyles } from '../../styles';
import { AppContext } from '../../app-context';
import { File } from '../../file';
import { AuthButton } from './auth-button';
import { initClient, uploadFile } from '../../ddc-operations/operations';
import { unwrap } from '../../unwrap';
import { BucketSelector } from './bucket-selector';
import { createSuspender } from '../../create-suspender';

const clientSuspender = createSuspender(initClient);

export function Files(): ReactElement {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    client, bucket, account, setAccount, setClient,
  } = useContext(AppContext);
  const [path, setPath] = useState('Files/test/sdsdsd');
  const [open, setOpen] = useState(false);
  const [files] = useState(new Array<File>());
  const [folderName, setFolderName] = useState('');

  const response = clientSuspender.read();

  useEffect(() => {
    if (response.client) {
      setClient(response.client);
    }
    if (response.account) {
      setAccount(response.account);
    }
  }, [response, setAccount, setClient]);

  const mode = useMemo(() => String(Object(location.state)?.mode), [location.state]);

  const renderPath = useMemo((): ReactElement[] => {
    const parts = path.split('/');

    const partElements = [
      <Grid item alignItems="center" key="bucket">
        <BucketSelector />
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
      partElements.push(<ArrowRight color="primary" />);
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
  }, [path]);

  const loadFiles = useCallback(async () => {
    // const contentAddressableStorage = await getContentAddressableStorage(mode, privateKey);
    // const query: Query = {
    //   bucketId,
    //   tags: [{ key: 'Path', value: path }],
    // };
    // const searchResult = await contentAddressableStorage.search(query);
    // const loadedFiles = searchResult.pieces
    //   .filter((p) => p.tags.some((t) => t.key === 'Path' && t.value === path))
    //   .map((p) => ({
    //     name: p.tags.find((t) => t.key === 'Name')?.value || '--',
    //     type: p.tags.find((t) => t.key === 'Type')?.value || '--',
    //     size: p.tags.find((t) => t.key === 'Size')?.value || '--',
    //     dateAdded: p.tags.find((t) => t.key === 'Date added')?.value || '--',
    //     cid: p.tags.find((t) => t.key === 'Type')?.value === 'File' ? u8aToString(p.data) : '',
    //   }));
    //
    // setFiles(loadedFiles);
  }, []);

  const handleFileSelect = async ({ target }: ChangeEvent<HTMLInputElement>) => {
    const file = target?.files?.[0];
    await uploadFile(unwrap(account).address, unwrap(client), bucket, unwrap(file));
    //
    // const contentAddressableStorage = await getContentAddressableStorage(mode, privateKey);
    // const fileStorage = await getFileStorage(privateKey);
    //
    // const dataPieceUri = await fileStorage.upload(bucketId, file.stream());
    // console.log(`File. Stored data piece uri=${dataPieceUri.toString()}`);
    // const metadataPiece: Piece = {
    //   data: stringToU8a(dataPieceUri.cid),
    //   tags: [
    //     { key: 'Type', value: 'File' },
    //     { key: 'Name', value: file.name },
    //     {
    //       key: 'Path',
    //       value: path,
    //     },
    //     { key: 'Size', value: file.size },
    //   ],
    //   links: [],
    // };
    //
    // const metadataPieceUri = await contentAddressableStorage.store(bucketId, metadataPiece);
    // console.log(`File. Stored metadata piece uri=${metadataPieceUri.toString()}`);
    await loadFiles();
  };

  const downloadFile = useCallback(async (name: string, cid: string) => {
    console.log({ name, cid });
    // const fileStorage = await getFileStorage(privateKey);
    // const file = fileStorage.read(bucketId, cid);
    // const fileReader = file.getReader();
    //
    // let result = await fileReader.read();
    // const chunks = [];
    // while (!result.done) {
    //   chunks.push(result.value);
    //   // eslint-disable-next-line no-await-in-loop
    //   result = await fileReader.read();
    // }
    // const blob = new Blob(chunks);
    // const url = window.URL.createObjectURL(blob);
    //
    // const link = document.createElement('a');
    // link.href = url;
    // link.setAttribute('download', name);
    //
    // // Append to html link element page
    // document.body.appendChild(link);
    //
    // // Start download
    // link.click();
  }, []);

  const doubleClickHandler = useCallback(
    (file: File) => () => (file.type === 'Folder' ? setPath(`${path}/${file.name}`) : downloadFile(file.name, file.cid)),
    [downloadFile, path],
  );

  const createFolder = useCallback(async () => {
    // const contentAddressableStorage = await getContentAddressableStorage(mode, privateKey);
    //
    // const piece: Piece = {
    //   data: stringToU8a(folderName),
    //   tags: [
    //     { key: 'Type', value: 'Folder' },
    //     { key: 'Name', value: folderName },
    //     { key: 'Path', value: path },
    //   ],
    //   links: [],
    // };
    // const pieceUri = await contentAddressableStorage.store(bucketId, piece);
    // console.log(`Folder. Stored piece uri=${pieceUri.toString()}`);

    setOpen(false);
    await loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (!mode) {
      navigate('/');
    }
  }, [mode, navigate]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <div className={styles.app}>
      <Container fixed>
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
                <AuthButton>{client ? 'Create another DDC client' : 'Create DDC client'}</AuthButton>
                <Button variant="contained" onClick={() => setOpen(true)}>
                  Create folder
                </Button>
                <label htmlFor="contained-button-file">
                  <input
                    className={styles.hidden}
                    id="contained-button-file"
                    multiple
                    type="file"
                    onChange={handleFileSelect}
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
                    <TableCell onDoubleClick={doubleClickHandler(file)}>
                      <Grid container direction="row" alignItems="center">
                        {file.type === 'Folder' ? (
                          <FolderIcon color="primary" />
                        ) : (
                          <InsertDriveFileIcon color="primary" />
                        )}
                        {file.name}
                      </Grid>
                    </TableCell>
                    <TableCell align="right">{file.size}</TableCell>
                    <TableCell align="right">{file.type}</TableCell>
                    <TableCell align="right">{file.dateAdded}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Create folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="folderName"
            label="Name"
            fullWidth
            variant="standard"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={createFolder}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
