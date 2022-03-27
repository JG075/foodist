import IngrediantItem from "./IngrediantItem"
import PropTypes from "prop-types"

function IngrediantList({ list }) {
    const ingrediantItems = list.map((item) => <IngrediantItem key={item.id} {...item} />)
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
