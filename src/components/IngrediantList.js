import IngrediantItem from "./IngrediantItem"
import PropTypes from "prop-types"

function IngrediantList({ list, onItemDelete }) {
    const ingrediantItems = list.map((item) => (
        <IngrediantItem key={item.id} onDelete={() => onItemDelete(item.id)} {...item} />
    ))
    return (
        <div>
            <ul>{ingrediantItems}</ul>
        </div>
    )
}

IngrediantList.propTypes = {
    list: PropTypes.array,
}

export default IngrediantList
