import { Error } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { DialogContent, DialogContentText } from "@mui/material"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"
import PropTypes from "prop-types"
import ErrorMsg from "./ErrorMsg"

const DeleteListDialog = ({ isOpen, onClose, onDelete, isDeleting, errorMsg }) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete this list?"}</DialogTitle>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <LoadingButton loading={isDeleting} onClick={onDelete} color="error" autoFocus>
                    Delete
                </LoadingButton>
            </DialogActions>
            {errorMsg && (
                <DialogContent sx={{ paddingTop: "0" }}>
                    <DialogContentText id="alert-dialog-description" sx={{ textAlign: "center" }}>
                        <ErrorMsg>{errorMsg}</ErrorMsg>
                    </DialogContentText>
                </DialogContent>
            )}
        </Dialog>
    )
}

DeleteListDialog.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onDelete: PropTypes.func,
    isDeleting: PropTypes.bool,
    errorMsg: PropTypes.string,
}

export default DeleteListDialog
