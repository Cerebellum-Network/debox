import React, {useCallback} from 'react';
import './App.css';
import {styled} from '@mui/material/styles';
import {Box, Button, ButtonGroup, Modal, TextField, Typography} from '@mui/material';
import {ContentAddressableStorage, Piece, Scheme} from '@cere-ddc-sdk/content-addressable-storage';
import {stringToU8a} from '@cere-ddc-sdk/util';

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


            /*   try {
                   await sendData({ user: user as User, request, ddcClient, subscriber });
                   setSubmitting(false);
                   resetForm();
               } catch (err) {
                   setSubmitting(false);
               }*/
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
