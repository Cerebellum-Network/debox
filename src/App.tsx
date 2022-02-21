import React, {useCallback} from 'react';
import './App.css';
import {styled} from '@mui/material/styles';
import {
    Box, Button, ButtonGroup, Modal, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography
} from '@mui/material';
import {ContentAddressableStorage, Piece, Scheme} from '@cere-ddc-sdk/content-addressable-storage';
import {stringToU8a} from '@cere-ddc-sdk/util';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const Input = styled('input')({
    display: 'none',
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

class File {
    name: string = ""
    size: string = ""
    kind: string = ""
    dateAdded: string = ""
}

const rows: Array<File> = [
    {name: 'photos', size: "0", kind: "Folder", dateAdded: "17.02.2022 at 17:32"},
    {name: '1628070362800410.pdf', size: "13000000", kind: "File", dateAdded: "15.02.2022 at 9:46"},
    {name: 'metadata.json', size: "11000", kind: "File", dateAdded: "9.02.2022 at 18:24"},
];

function App() {
    const [open, setOpen] = React.useState(false);
    const handleOpenCreateFolderModal = () => setOpen(true);
    const handleCloseCreateFolderModal = () => setOpen(false);

    const contentAddressableStorage = new ContentAddressableStorage(new Scheme("sr25519", "0x30598696b0989acdc8e8a2a5faf69ccc5967e03dc290385d5943dc48a3b8624ea0252c2673368bb1b1a7e53336c86b209590c05cd2664a596c8e2ac729a5f182"), "https://node-0.gateway.devnet.cere.network")

    const createFolder = useCallback(
        async (e) => {
            const formData = new FormData(e.currentTarget);
            e.preventDefault();

            let folderName = formData.get('folderName') as string;

            console.log(folderName)
            const piece: Piece = {
                data: stringToU8a(folderName),
                tags: [{key: "type", value: "Folder"}, {key: "name", value: folderName}]
            };
            const pieceUri = await contentAddressableStorage.store(BigInt(10), piece)
            console.log("Stored piece uri=" + pieceUri.toString())
        }, []
        //[ddcClient, resetForm, resetLog, setSubmitting, subscriber, user],
    );

    return (
        <div className="App">
            <Button variant="contained" onClick={handleOpenCreateFolderModal}>Create folder</Button>
            <label htmlFor="contained-button-file">
                <Input accept="image/*" id="contained-button-file" multiple type="file"/>
                <Button variant="contained" component="span">
                    Upload
                </Button>
            </label>

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
                        {rows.map((row) => (
                            <TableRow
                                key={row.name}
                                sx={{'&:last-child td, &:last-child th': {border: 0}}}
                            >
                                <TableCell component="th" scope="row">
                                    {(row.kind) === "Folder" ? <FolderIcon color="primary"/> :
                                        <InsertDriveFileIcon color="primary"/>}
                                    {row.name}
                                </TableCell>
                                <TableCell align="right">{(row.kind) === "Folder" ? "--" : row.size}</TableCell>
                                <TableCell align="right">{row.kind}</TableCell>
                                <TableCell align="right">{row.dateAdded}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal
                open={open}
                onClose={handleCloseCreateFolderModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        New folder
                    </Typography>
                    <form onSubmit={createFolder}>
                        <TextField id="standard-basic" label="Name" variant="outlined" name="folderName"/>
                        <Box>
                            <ButtonGroup variant="text" aria-label="text button group">
                                <Button onClick={handleCloseCreateFolderModal}>Cancel</Button>
                                <Button type="submit">Create</Button>
                            </ButtonGroup>
                        </Box>
                    </form>

                </Box>
            </Modal>
        </div>
    );
}

export default App;
