import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import DeleteIcon from "@mui/icons-material/Delete"
import { SxProps } from "@mui/system"

interface DeleteRecipeButtonProps {
    onClick: LoadingButtonProps["onClick"]
    sx: SxProps
}

const DeleteRecipeButton = ({ onClick, sx }: DeleteRecipeButtonProps) => {
    return (
        <LoadingButton
            sx={{
                padding: "4px 9px",
                minWidth: "0",
                ".MuiButton-startIcon": { margin: "0" },
                ...sx,
            }}
            aria-label="delete recipe"
            startIcon={<DeleteIcon />}
            variant="outlined"
            onClick={onClick}
        />
    )
}

export default DeleteRecipeButton
