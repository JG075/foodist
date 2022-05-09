import { ReactNode } from "react"
import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { DialogContent, DialogContentText } from "@mui/material"
import Button, { ButtonProps } from "@mui/material/Button"
import Dialog, { DialogProps } from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogTitle from "@mui/material/DialogTitle"

import ErrorMsg from "./ErrorMsg"

interface DeleteListDialogProps {
    isOpen: DialogProps["open"]
    onClose: ButtonProps["onClick"]
    onDelete: LoadingButtonProps["onClick"]
    isDeleting: LoadingButtonProps["loading"]
    errorMsg: ReactNode
}

const DeleteListDialog = ({ isOpen, onClose, onDelete, isDeleting, errorMsg }: DeleteListDialogProps) => {
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

export default DeleteListDialog
