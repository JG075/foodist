/** @jsxImportSource @emotion/react */
import { ReactNode } from "react"
import { Link, LinkProps } from "react-router-dom"
import ListItem from "@mui/material/ListItem"
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow"

interface IngrediantListsItemProps {
    name: ReactNode
    to: LinkProps["to"]
}

const IngrediantListsItem = ({ name, to }: IngrediantListsItemProps) => {
    return (
        <Link to={to} css={{ color: "black " }}>
            <ListItem
                sx={{
                    boxShadow: "0px 1px 0px 0px #a6a6a6",
                    border: "1px solid #9f9f9f",
                    borderRadius: "5px",
                    padding: "15px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "500",
                    marginBottom: "15px",
                }}
            >
                {name}
                <DoubleArrowIcon color="primary" />
            </ListItem>
        </Link>
    )
}

export default IngrediantListsItem
