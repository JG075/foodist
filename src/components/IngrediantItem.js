import PropTypes from "prop-types"
import Qty from "js-quantities"
import ListItem from "@mui/material/ListItem"
import Checkbox from "@mui/material/Checkbox"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"
/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react/macro"

function IngrediantItem({ name, qty, onDelete }) {
    return (
        <ListItem
            sx={{
                boxShadow: "1px 2px 0px 1px #d9d9d9",
                border: "1px solid #cacaca",
                borderRadius: "5px",
                padding: "6px 12px",
                marginBottom: "10px",
            }}
        >
            <Checkbox edge="start" />
            <span>{name}</span>&nbsp;
            <span
                css={css`
                    color: #7d7c7c;
                `}
            >
                {qty.format()}
            </span>
            <IconButton
                aria-label="delete"
                onClick={onDelete}
                edge="end"
                sx={{
                    marginLeft: "auto",
                }}
            >
                <DeleteIcon />
            </IconButton>
        </ListItem>
    )
}

IngrediantItem.propTypes = {
    name: PropTypes.string,
    qty: PropTypes.instanceOf(Qty),
}

export default IngrediantItem
