/** @jsxImportSource @emotion/react */
import React from "react"
import PropTypes from "prop-types"
import ListItem from "@mui/material/ListItem"
import Checkbox from "@mui/material/Checkbox"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"

import ModelIngrediant from "../models/Ingrediant"

const IngrediantItem = React.forwardRef(({ item, onDelete, onItemCheck, allowEdit }, ref) => {
    const { name, qty, checked } = item
    return (
        <ListItem
            sx={{
                boxShadow: "0px 1px 0px 0px #a6a6a6",
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
            ref={ref}
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
            {allowEdit && (
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
            )}
        </ListItem>
    )
})

IngrediantItem.propTypes = {
    item: PropTypes.instanceOf(ModelIngrediant),
    onDelete: PropTypes.func,
    onItemCheck: PropTypes.func,
    allowEdit: PropTypes.bool,
}

export default IngrediantItem
