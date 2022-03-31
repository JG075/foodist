/** @jsxImportSource @emotion/react */
import PropTypes from "prop-types"
import Qty from "js-quantities"
import ListItem from "@mui/material/ListItem"
import Checkbox from "@mui/material/Checkbox"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"

export const completedStyle = {
    background: "#f3f3f3",
    "& .ingrediant": {
        textDecoration: "line-through",
        color: "#7d7c7c",
    },
}

function IngrediantItem({ name, qty, checked, onDelete, onItemCheck }) {
    return (
        <ListItem
            sx={{
                boxShadow: "1px 2px 0px 1px #d9d9d9",
                border: "1px solid #cacaca",
                borderRadius: "5px",
                padding: "6px 12px",
                marginBottom: "10px",
            }}
            css={checked && completedStyle}
        >
            <Checkbox checked={checked} edge="start" onChange={onItemCheck} />
            <span className="ingrediant">
                <span>{name}</span>&nbsp;
                <span
                    css={{
                        color: "#7d7c7c",
                    }}
                >
                    {qty.format()}
                </span>
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
    onDelete: PropTypes.func,
    onItemCheck: PropTypes.func,
    completed: PropTypes.bool,
}

export default IngrediantItem
