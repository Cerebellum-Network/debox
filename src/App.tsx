import React, {ReactElement, useCallback, useEffect} from 'react';
import './App.css';
import {styled} from '@mui/material/styles';
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
    TextField
} from '@mui/material';
import {
    ContentAddressableStorage,
    Piece,
    Query,
    Scheme,
    SchemeInterface
} from '@cere-ddc-sdk/content-addressable-storage';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import {stringToU8a, u8aToHex, u8aToString} from "@polkadot/util";
import {web3Accounts, web3Enable, web3FromAddress} from "@polkadot/extension-dapp";
import {waitReady} from "@polkadot/wasm-crypto";
import {decodeAddress} from "@polkadot/util-crypto";

const Input = styled('input')({
    display: 'none',
});

const defaultPath = "Files"

const bucketId = BigInt(2)

class File {
    name: string = ""
    size: string = ""
    type: string = ""
    dateAdded: string = ""

    cid: string = ""
}

let privateKey = "0xc6bbaccc6ebb403c551efb5600e1ce46324d1887c1e04be71e253c752a6a41b2"

async function getContentAddressableStorage(mode: string): Promise<ContentAddressableStorage> {
    let scheme: SchemeInterface
    if (mode === "full") {
        await web3Enable("DEBOX")
        let accounts = await web3Accounts()
        console.log(accounts.length)
        console.log(accounts.find(acc => acc.address === "5H9ezVeV3VZfKLYRbKHtdSErnUo4xrAFVadVnV7NPkCBKzZ1"))
        let account = accounts.find(acc => acc.address === "5H9ezVeV3VZfKLYRbKHtdSErnUo4xrAFVadVnV7NPkCBKzZ1")!!

        await waitReady()

        let injector = await web3FromAddress(account.address);
        let signRaw = injector.signer.signRaw;

        if (!signRaw) {
            throw Error("Failed to initialise scheme")
        }

        let publicKeyHex = u8aToHex(decodeAddress(account.address))

        scheme = {
            name: "sr25519",
            publicKeyHex: publicKeyHex,
            sign: async (data: Uint8Array): Promise<string> => {
                const {signature} = await signRaw!!({
                    address: account.address,
                    data: u8aToHex(data),
                    type: 'bytes'
                });

                return signature;
            }
        }
    } else {
        scheme = await Scheme.createScheme("sr25519", privateKey)
    }

    return new ContentAddressableStorage(scheme, "https://node-0.gateway.devnet.cere.network")
}

function App() {
    const [path, setPath] = React.useState(defaultPath);
    const [open, setOpen] = React.useState(false);
    const [allowFrontend, setAllowFrontend] = React.useState(false);
    const [allowBackend, setAllowBackend] = React.useState(false);
    const [mode, setMode] = React.useState("");
    const [folderName, setFolderName] = React.useState("");
    const [files, setFiles] = React.useState(new Array<File>());
    const handleOpenCreateFolderModal = () => setOpen(true);
    const handleCloseCreateFolderModal = () => setOpen(false);

    const handleOpenAllowFrontendModal = () => setAllowFrontend(true);
    const handleCloseAllowFrontendModal = () => setAllowFrontend(false);

    const handleOpenAllowBackendModal = () => setAllowBackend(true);
    const handleCloseAllowBackendModal = () => setAllowBackend(false);

    let loadFiles = useCallback(async () => {
        let contentAddressableStorage = await getContentAddressableStorage(mode)

        let query: Query = {
            bucketId: bucketId,
            tags: [{key: "Path", value: path}]
        }
        console.log(query)
        let searchResult = await contentAddressableStorage!!.search(query)
        let files = searchResult.pieces.filter(p => p.tags.some(t => t.key === "Path" && t.value === path)).map(p => ({
            name: p.tags.find(t => t.key === "Name")?.value || "--",
            type: p.tags.find(t => t.key === "Type")?.value || "--",
            size: p.tags.find(t => t.key === "Size")?.value || "--",
            dateAdded: p.tags.find(t => t.key === "Date added")?.value || "--",
            cid: p.tags.find(t => t.key === "Type")?.value === "File" ? u8aToString(p.data) : "",
        }))

        setFiles(files);
    }, [mode, path])

    useEffect(() => {
        loadFiles()
    }, [loadFiles])

    const openFolder = async (path: string) => {
        setPath(path)
    }

    const downloadFile = async (name: string, cid: string) => {
        let contentAddressableStorage = await getContentAddressableStorage(mode)
        let file = await contentAddressableStorage.read(bucketId, cid)

        const url = window.URL.createObjectURL(
            new Blob([file.data]),
        );

        console.log("TAGS")
        console.log(file.tags)
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            name,
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();
    }

    const renderPath = (path: string): ReactElement[] => {
        let parts = path.split("/")

        console.log(path)
        console.log(parts.length)

        let partElements = []
        let linkPath = ""
        for (let i = 0; i < parts.length - 1; i++) {
            let folderPath = linkPath + parts[i]
            linkPath += parts[i] + "/"

            partElements.push(
                <Grid item alignItems="center" key={linkPath}>
                    <Button variant="text" onClick={() => openFolder(folderPath)}> {parts[i]}</Button>

                </Grid>
            )
            partElements.push(<ArrowRightIcon color="primary"/>)
        }

        console.log(path)
        console.log(parts.length)
        console.log(parts.length - 1)
        linkPath += parts[parts.length - 1]
        partElements.push(<Grid item alignItems="center" key={linkPath}>
            <Button variant="text" onClick={() => openFolder(linkPath)}> {parts[parts.length - 1]}</Button>
        </Grid>)

        return partElements;
    }

    const createFolder = useCallback(
        async () => {
            let contentAddressableStorage = await getContentAddressableStorage(mode)

            const piece: Piece = {
                data: stringToU8a(folderName),
                tags: [{key: "Type", value: "Folder"}, {key: "Name", value: folderName}, {key: "Path", value: path}]
            };
            console.log(piece)
            const pieceUri = await contentAddressableStorage!!.store(bucketId, piece)
            console.log("Folder. Stored piece uri=" + pieceUri.toString())

            setOpen(false)
            loadFiles()
        }, [folderName, loadFiles, mode, path]
    );

    // On file select (from the pop up)
    const handleFileSelect = async ({target}: any) => {
        console.log("On file select")
        let file = target.files[0];
        console.log(file.name);
        console.log(file);
        console.log(file.value);

        let reader = new FileReader();
        reader.readAsArrayBuffer(file)

        reader.onload = async function (e) {
            let contentAddressableStorage = await getContentAddressableStorage(mode)

            let result = e.target!!.result;
            let data = new Uint8Array(result as ArrayBuffer);

            let dataPiece: Piece = {
                data: data,
                tags: []
            };
            let dataPieceUri = await contentAddressableStorage!!.store(bucketId, dataPiece)
            console.log("File. Stored data piece uri=" + dataPieceUri.toString())
            const metadataPiece: Piece = {
                data: stringToU8a(dataPieceUri.cid),
                tags: [{key: "Type", value: "File"}, {key: "Name", value: file.name}, {
                    key: "Path",
                    value: path
                }, {key: "Size", value: file.size}]
            };

            const metadataPieceUri = await contentAddressableStorage!!.store(bucketId, metadataPiece)
            console.log("File. Stored metadata piece uri=" + metadataPieceUri.toString())

            loadFiles()
        }
    };

    if (mode === "") {
        return (
            <div className="App">
                <Container fixed>
                    <Stack spacing={2} justifyContent="center"
                           alignItems="center" direction="row" pt={3}>
                        <Button variant="outlined" onClick={() => setMode("full")}>Full control</Button>
                        <Button variant="outlined" onClick={handleOpenAllowBackendModal}>Trust Backend App</Button>
                        <Button variant="outlined" onClick={handleOpenAllowFrontendModal}>Trust Frontend App</Button>
                    </Stack>
                </Container>

                <Dialog open={allowBackend} onClose={handleCloseAllowBackendModal} fullWidth>
                    <DialogTitle>Here you should give an access to some backend service to access your
                        bucket</DialogTitle>
                    <DialogActions>
                        <Button onClick={handleCloseAllowBackendModal}>Cancel</Button>
                        <Button onClick={() => setMode("backend")}>Ok</Button>
                    </DialogActions>
                </Dialog>


                <Dialog open={allowFrontend} onClose={handleCloseAllowFrontendModal} fullWidth>
                    <DialogTitle>Private key to be used for requests signing</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="privateKey"
                            label="Private key"
                            fullWidth
                            variant="standard"
                            value={privateKey}
                            onChange={(e) => {
                                privateKey = e.target.value;
                            }}
                        />

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAllowFrontendModal}>Cancel</Button>
                        <Button onClick={() => setMode("frontend")}>Save</Button>
                    </DialogActions>
                </Dialog>

            </div>
        )
    }

    return (
        <div className="App">
            <Container fixed>

                <Grid mt={4} container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
                    <Grid item xs={6}>
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="left"
                            justifyContent="left"
                        >
                            <ButtonGroup>
                                <Grid container direction="row" alignItems="center">
                                    {renderPath(path)}
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
                        >
                            <Stack direction="row" spacing={2} justifyContent="end">
                                <Button variant="contained" onClick={handleOpenCreateFolderModal}>Create folder</Button>
                                <label htmlFor="contained-button-file">
                                    <Input id="contained-button-file" multiple type="file"
                                           onChange={handleFileSelect}/>
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
                        <Table sx={{minWidth: 650}} aria-label="simple table">
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
                                        sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                    >
                                        <TableCell
                                            onDoubleClick={() => (file.type) === "Folder" ? openFolder(path + "/" + file.name) : downloadFile(file.name, file.cid)}>
                                            <Grid container direction="row" alignItems="center">
                                                {(file.type) === "Folder" ? <FolderIcon color="primary"/> :
                                                    <InsertDriveFileIcon color="primary"/>}
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


            <Dialog open={open} onClose={handleCloseCreateFolderModal} fullWidth>
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
                    <Button onClick={handleCloseCreateFolderModal}>Cancel</Button>
                    <Button onClick={createFolder}>Create</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default App;
