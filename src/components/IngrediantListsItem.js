/** @jsxImportSource @emotion/react */
import { Link } from "react-router-dom"
import PropTypes from "prop-types"
import ListItem from "@mui/material/ListItem"
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow"

const IngrediantListsItem = ({ name, to }) => {
    return (
        <Link to={to} css={{ color: "black " }}>
            <ListItem
                sx={{
                    boxShadow: "0px 1px 0px 0px #4e1d1e",
                    border: "1px solid #9f9f9f",
                    borderRadius: "5px",
                    padding: "15px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "500",
                    marginBottom: "15px",
                }}
            >
                {name || "Unnamed list"}
                <DoubleArrowIcon color="primary" />
            </ListItem>
        </Link>
    )
}

IngrediantListsItem.propTypes = {
    name: PropTypes.node,
    url: PropTypes.string,
}

export default IngrediantListsItem
