import PropTypes from "prop-types"
import Qty from "js-quantities"

function IngrediantItem({ name, qty, onDelete }) {
    return (
        <li>
            <span>{name}</span> <span>{qty.format().replace(/ /g, "")}</span>
            <button onClick={onDelete}>X</button>
        </li>
    )
}

IngrediantItem.propTypes = {
    name: PropTypes.string,
    qty: PropTypes.instanceOf(Qty),
}

export default IngrediantItem
