import { LoadingButton } from "@mui/lab"
import PropTypes from "prop-types"
import DeleteIcon from "@mui/icons-material/Delete"

const DeleteListButton = ({ onClick, sx }) => {
    return (
        <LoadingButton
            sx={{
                padding: "4px 9px",
                minWidth: "0",
                ".MuiButton-startIcon": { margin: "0" },
                ...sx,
            }}
            aria-label="delete list"
            startIcon={<DeleteIcon />}
            variant="outlined"
            onClick={onClick}
        />
    )
}

DeleteListButton.propTypes = {
    onClick: PropTypes.func,
}

export default DeleteListButton
