/** @jsxImportSource @emotion/react */
import PropTypes from "prop-types"
import Qty from "js-quantities"
import ListItem from "@mui/material/ListItem"
import Checkbox from "@mui/material/Checkbox"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"

function IngrediantItem({ name, qty, checked, onDelete, onItemCheck }) {
    return (
        <ListItem
            sx={{
                boxShadow: "0px 1px 0px 0px #4e1d1e",
                border: "1px solid #9f9f9f",
                borderRadius: "5px",
                padding: "6px 12px",
                marginBottom: "10px",
            }}
            css={
                checked && {
                    background: "#f3f3f3",
                    opacity: 0.75,
                    "& .ingrediant": {
                        textDecoration: "line-through",
                        color: "#7d7c7c",
                    },
                }
            }
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
