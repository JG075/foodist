import IngrediantItem from "./IngrediantItem"
import PropTypes from "prop-types"
import List from "@mui/material/List"

function IngrediantList({ list, onItemDelete, onItemCheck }) {
    const ingrediantItems = list.map((item) => (
        <IngrediantItem
            key={item.id}
            onDelete={() => onItemDelete(item.id)}
            onItemCheck={() => onItemCheck(item.id)}
            {...item}
        />
    ))
    return (
        <div>
            <List dense sx={{ width: "100%", bgcolor: "background.paper" }}>
                {ingrediantItems}
            </List>
        </div>
    )
}

IngrediantList.propTypes = {
    list: PropTypes.array,
    onItemDelete: PropTypes.func,
    onItemCheck: PropTypes.func,
}

export default IngrediantList
