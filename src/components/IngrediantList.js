import IngrediantItem from "./IngrediantItem"
import PropTypes from "prop-types"
import List from "@mui/material/List"
import ModelIngrediant from "../models/Ingrediant"

const IngrediantList = ({ list, onItemDelete, onItemCheck }) => {
    const ingrediantItems = list.map((item) => (
        <IngrediantItem
            key={item.id}
            item={item}
            onDelete={() => onItemDelete(item.id)}
            onItemCheck={() => onItemCheck(item.id)}
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
    list: PropTypes.arrayOf(PropTypes.instanceOf(ModelIngrediant)),
    onItemDelete: PropTypes.func,
    onItemCheck: PropTypes.func,
}

export default IngrediantList
