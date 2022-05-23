/** @jsxImportSource @emotion/react */
import React from "react"
import ListItem from "@mui/material/ListItem"
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox"
import IconButton, { IconButtonProps } from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"

import Ingrediant from "../models/Ingrediant"

export interface IngrediantItemProps {
    item: Ingrediant
    onDelete: IconButtonProps["onClick"]
    onItemCheck: CheckboxProps["onChange"]
    allowEdit?: boolean
}

const IngrediantItem = React.forwardRef<HTMLLIElement, IngrediantItemProps>(
    ({ item, onDelete, onItemCheck, allowEdit = false }, ref) => {
        const { name, qty, checked } = item
        return (
            <ListItem
                sx={{
                    boxShadow: "0px 1px 0px 0px #a6a6a6",
                    border: "1px solid #9f9f9f",
                    borderRadius: "5px",
                    padding: "6px 12px",
                    marginBottom: "10px",
                    "&:last-child": {
                        marginBottom: 0,
                    },
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
    }
)

export default IngrediantItem
